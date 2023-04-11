import dayjs from 'dayjs';
import * as S from 'microstruct';
import { browser } from '../browser';
import { postMessage } from '../messages';
import { Ruleset } from '../ruleset';
import { Result } from '../types';
import { Mutex, errorResult, numberKeys, successResult } from '../utilities';
import { syncFile } from './clouds';
import {
  RawStorageItems,
  loadAllFromRawStorage,
  modifyAllInRawStorage,
  saveToRawStorage,
} from './raw-storage';
import { updateAll as updateAllSubscriptions } from './subscriptions';

const SYNC_DELAY = 5; // in seconds
const SYNC_BLOCKLIST_FILENAME = 'uBlacklist.txt';
const SYNC_GENERAL_FILENAME = 'general.json';
const SYNC_APPEARANCE_FILENAME = 'appearance.json';
const SYNC_SUBSCRIPTIONS_FILENAME = 'subscriptions.json';

export const SYNC_ALARM_NAME = 'sync';

export type SyncDirtyFlags = {
  blocklist: boolean;
  general: boolean;
  appearance: boolean;
  subscriptions: boolean;
};

type SyncSection = {
  beforeSync(
    items: Readonly<RawStorageItems>,
    dirtyFlags: Readonly<SyncDirtyFlags>,
  ): { shouldUpload: boolean };
  beforeUpload(localItems: Readonly<RawStorageItems>): {
    filename: string;
    content: string;
    modifiedTime: dayjs.Dayjs;
  };
  afterDownload(
    cloudItems: Partial<RawStorageItems>,
    cloudContent: string,
    cloudModifiedTime: dayjs.Dayjs,
    localItems: Readonly<RawStorageItems>,
  ): void;
  afterDownloadAll(
    cloudItems: Partial<RawStorageItems>,
    latestLocalItems: Readonly<RawStorageItems>,
  ): void;
  afterSync?(cloudItems: Readonly<Partial<RawStorageItems>>): void;
};

const mutex = new Mutex();
let timeoutId: number | null = null;
let dirtyFlags: SyncDirtyFlags | null = null;

const syncSections: readonly SyncSection[] = [
  // blocklist
  {
    beforeSync(items, dirtyFlags) {
      return { shouldUpload: (items.syncBlocklist && dirtyFlags.blocklist) || false };
    },
    beforeUpload(localItems) {
      return {
        filename: SYNC_BLOCKLIST_FILENAME,
        content: localItems.blacklist,
        modifiedTime: dayjs(localItems.timestamp),
      };
    },
    afterDownload(cloudItems, cloudContent, cloudModifiedTime) {
      cloudItems.blacklist = cloudContent;
      cloudItems.compiledRules = Ruleset.compile(cloudItems.blacklist);
      cloudItems.timestamp = cloudModifiedTime.toISOString();
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.timestamp != null &&
        dayjs(cloudItems.timestamp).isBefore(latestLocalItems.timestamp)
      ) {
        delete cloudItems.blacklist;
        delete cloudItems.compiledRules;
        delete cloudItems.timestamp;
      }
    },
    afterSync(cloudItems) {
      if (cloudItems.blacklist != null) {
        postMessage('blocklist-saved', cloudItems.blacklist, 'background');
      }
    },
  },
  // general
  {
    beforeSync(items, dirtyFlags) {
      return { shouldUpload: (items.syncGeneral && dirtyFlags.general) || false };
    },
    beforeUpload(localItems) {
      return {
        filename: SYNC_GENERAL_FILENAME,
        content: JSON.stringify({
          skipBlockDialog: localItems.skipBlockDialog,
          hideBlockLinks: localItems.hideBlockLinks,
          hideControl: localItems.hideControl,
          enablePathDepth: localItems.enablePathDepth,
          blockWholeSite: localItems.blockWholeSite,
        }),
        modifiedTime: dayjs(localItems.generalLastModified),
      };
    },
    afterDownload(cloudItems, cloudContent, cloudModifiedTime) {
      const items = S.parse(
        cloudContent,
        S.type({
          skipBlockDialog: S.boolean(),
          hideBlockLinks: S.boolean(),
          hideControl: S.boolean(),
          enablePathDepth: S.boolean(),
          blockWholeSite: S.optional(S.boolean()),
        }),
      );
      if (!items) {
        throw new Error(`File corrupted: ${SYNC_GENERAL_FILENAME}`);
      }
      cloudItems.skipBlockDialog = items.skipBlockDialog;
      cloudItems.hideBlockLinks = items.hideBlockLinks;
      cloudItems.hideControl = items.hideControl;
      cloudItems.enablePathDepth = items.enablePathDepth;
      if (items.blockWholeSite != null) {
        cloudItems.blockWholeSite = items.blockWholeSite;
      }
      cloudItems.generalLastModified = cloudModifiedTime.toISOString();
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.generalLastModified != null &&
        dayjs(cloudItems.generalLastModified).isBefore(latestLocalItems.generalLastModified)
      ) {
        delete cloudItems.skipBlockDialog;
        delete cloudItems.hideBlockLinks;
        delete cloudItems.hideControl;
        delete cloudItems.enablePathDepth;
        delete cloudItems.blockWholeSite;
        delete cloudItems.generalLastModified;
      }
    },
  },
  // appearance
  {
    beforeSync(items, dirtyFlags) {
      return { shouldUpload: (items.syncAppearance && dirtyFlags.appearance) || false };
    },
    beforeUpload(localItems) {
      return {
        filename: SYNC_APPEARANCE_FILENAME,
        content: JSON.stringify({
          linkColor: localItems.linkColor,
          blockColor: localItems.blockColor,
          highlightColors: localItems.highlightColors,
          dialogTheme: localItems.dialogTheme,
        }),
        modifiedTime: dayjs(localItems.appearanceLastModified),
      };
    },
    afterDownload(cloudItems, cloudContent, cloudModifiedTime) {
      const items = S.parse(
        cloudContent,
        S.type({
          linkColor: S.string(),
          blockColor: S.string(),
          highlightColors: S.array(S.string()),
          dialogTheme: S.enums(['light', 'dark', 'default'] as const),
        }),
      );
      if (!items) {
        throw new Error(`File corrupted: ${SYNC_APPEARANCE_FILENAME}`);
      }
      cloudItems.linkColor = items.linkColor;
      cloudItems.blockColor = items.blockColor;
      cloudItems.highlightColors = items.highlightColors;
      cloudItems.dialogTheme = items.dialogTheme;
      cloudItems.appearanceLastModified = cloudModifiedTime.toISOString();
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.appearanceLastModified != null &&
        dayjs(cloudItems.appearanceLastModified).isBefore(latestLocalItems.appearanceLastModified)
      ) {
        delete cloudItems.linkColor;
        delete cloudItems.blockColor;
        delete cloudItems.highlightColors;
        delete cloudItems.dialogTheme;
        delete cloudItems.appearanceLastModified;
      }
    },
  },
  // subscriptions
  {
    beforeSync(items, dirtyFlags) {
      return { shouldUpload: (items.syncSubscriptions && dirtyFlags.subscriptions) || false };
    },
    beforeUpload(localItems) {
      return {
        filename: SYNC_SUBSCRIPTIONS_FILENAME,
        content: JSON.stringify(
          Object.values(localItems.subscriptions).map(s => ({
            name: s.name,
            url: s.url,
            enabled: s.enabled ?? true,
          })),
        ),
        modifiedTime: dayjs(localItems.subscriptionsLastModified),
      };
    },
    afterDownload(cloudItems, cloudContent, cloudModifiedTime, localItems) {
      const items = S.parse(
        cloudContent,
        S.array(S.type({ name: S.string(), url: S.string(), enabled: S.optional(S.boolean()) })),
      );
      if (!items) {
        throw new Error(`File corrupted: ${SYNC_SUBSCRIPTIONS_FILENAME}`);
      }
      cloudItems.subscriptions = {};
      cloudItems.nextSubscriptionId = localItems.nextSubscriptionId;
      for (const { name, url, enabled } of items) {
        cloudItems.subscriptions[cloudItems.nextSubscriptionId++] = {
          name,
          url,
          blacklist: '',
          updateResult: null,
          enabled: enabled ?? true,
        };
      }
      cloudItems.subscriptionsLastModified = cloudModifiedTime.toISOString();
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.subscriptionsLastModified != null &&
        dayjs(cloudItems.subscriptionsLastModified).isBefore(
          latestLocalItems.subscriptionsLastModified,
        )
      ) {
        delete cloudItems.subscriptions;
        delete cloudItems.nextSubscriptionId;
        delete cloudItems.subscriptionsLastModified;
      }
    },
    afterSync(cloudItems) {
      if (cloudItems.subscriptions && numberKeys(cloudItems.subscriptions).length) {
        void updateAllSubscriptions();
      }
    },
  },
];

async function doSync(dirtyFlags: SyncDirtyFlags, repeat: boolean): Promise<void> {
  return mutex.lock(async () => {
    const localItems = await loadAllFromRawStorage();

    if (!localItems.syncCloudId) {
      if (repeat) {
        await browser.alarms.clear(SYNC_ALARM_NAME);
      }
      return;
    }
    if (repeat) {
      // `chrome.alarms.create` returns `Promise` in Chrome >=111.
      void browser.alarms.create(SYNC_ALARM_NAME, { periodInMinutes: localItems.syncInterval });
    }

    const cloudItems: Partial<RawStorageItems> = {};
    const promises: Promise<void>[] = [];
    for (const section of syncSections) {
      if (section.beforeSync(localItems, dirtyFlags).shouldUpload) {
        promises.push(
          (async () => {
            const {
              filename,
              content: localContent,
              modifiedTime: localModifiedTime,
            } = section.beforeUpload(localItems);
            const cloudFile = await syncFile(filename, localContent, localModifiedTime);
            if (!cloudFile) {
              return;
            }
            section.afterDownload(
              cloudItems,
              cloudFile.content,
              cloudFile.modifiedTime,
              localItems,
            );
          })(),
        );
      }
    }
    if (!promises.length) {
      return;
    }

    postMessage('syncing', localItems.syncCloudId);

    let result: Result;
    try {
      await Promise.all(promises);
      await modifyAllInRawStorage(latestLocalItems => {
        if (latestLocalItems.syncCloudId !== localItems.syncCloudId) {
          return {};
        }
        for (const section of syncSections) {
          section.afterDownloadAll(cloudItems, latestLocalItems);
        }
        return cloudItems;
      });
      for (const section of syncSections) {
        section.afterSync?.(cloudItems);
      }
      result = successResult();
    } catch (e: unknown) {
      result = errorResult(e instanceof Error ? e.message : 'Unknown error');
    }
    await saveToRawStorage({ syncResult: result });

    postMessage('synced', localItems.syncCloudId, result, Object.keys(cloudItems).length !== 0);
  });
}

export function sync(): Promise<void> {
  return doSync({ blocklist: true, general: true, appearance: true, subscriptions: true }, true);
}

export function syncDelayed(dirtyFlagsUpdate: Partial<SyncDirtyFlags>): void {
  dirtyFlags = {
    ...(dirtyFlags || {
      blocklist: false,
      general: false,
      appearance: false,
      subscriptions: false,
    }),
    ...dirtyFlagsUpdate,
  };
  if (timeoutId != null) {
    self.clearTimeout(timeoutId);
  }
  timeoutId = self.setTimeout(() => {
    if (dirtyFlags) {
      void doSync(dirtyFlags, false);
    }
    timeoutId = null;
    dirtyFlags = null;
  }, SYNC_DELAY * 1000);
}

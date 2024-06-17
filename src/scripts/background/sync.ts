import dayjs from "dayjs";
import { z } from "zod";
import { browser } from "../browser.ts";
import { postMessage } from "../messages.ts";
import type { Result, Subscriptions } from "../types.ts";
import {
  Mutex,
  errorResult,
  numberKeys,
  parseJSON,
  successResult,
  toPlainRuleset,
} from "../utilities.ts";
import { syncFile } from "./clouds.ts";
import {
  type RawStorageItems,
  loadAllFromRawStorage,
  modifyAllInRawStorage,
  saveToRawStorage,
} from "./raw-storage.ts";
import { updateAll as updateAllSubscriptions } from "./subscriptions.ts";

const SYNC_DELAY = 5; // in seconds
const SYNC_BLOCKLIST_FILENAME = "uBlacklist.txt";
const SYNC_GENERAL_FILENAME = "general.json";
const SYNC_APPEARANCE_FILENAME = "appearance.json";
const SYNC_SUBSCRIPTIONS_FILENAME = "subscriptions.json";

export const SYNC_ALARM_NAME = "sync";

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
    cloudItems: Readonly<Partial<RawStorageItems>>,
    cloudContent: string,
    cloudModifiedTime: dayjs.Dayjs,
    localItems: Readonly<RawStorageItems>,
  ): Partial<RawStorageItems>;
  afterDownloadAll(
    cloudItems: Readonly<Partial<RawStorageItems>>,
    latestLocalItems: Readonly<RawStorageItems>,
  ): Partial<RawStorageItems>;
  afterSync?(cloudItems: Readonly<Partial<RawStorageItems>>): void;
};

const mutex = new Mutex();
let timeoutId: number | null = null;
let dirtyFlags: SyncDirtyFlags | null = null;

const syncSections: readonly SyncSection[] = [
  // blocklist
  {
    beforeSync(items, dirtyFlags) {
      return {
        shouldUpload: (items.syncBlocklist && dirtyFlags.blocklist) || false,
      };
    },
    beforeUpload(localItems) {
      return {
        filename: SYNC_BLOCKLIST_FILENAME,
        content: localItems.blacklist,
        modifiedTime: dayjs(localItems.timestamp),
      };
    },
    afterDownload(cloudItems, cloudContent, cloudModifiedTime) {
      const source = cloudContent;
      return {
        ...cloudItems,
        ruleset: toPlainRuleset(source),
        blacklist: source,
        timestamp: cloudModifiedTime.toISOString(),
      };
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.timestamp != null &&
        dayjs(cloudItems.timestamp).isBefore(latestLocalItems.timestamp)
      ) {
        const { ruleset, blacklist, timestamp, ...newCloudItems } = cloudItems;
        return newCloudItems;
      }
      return { ...cloudItems };
    },
    afterSync(cloudItems) {
      if (cloudItems.blacklist != null) {
        postMessage("blocklist-saved", cloudItems.blacklist, "background");
      }
    },
  },
  // general
  {
    beforeSync(items, dirtyFlags) {
      return {
        shouldUpload: (items.syncGeneral && dirtyFlags.general) || false,
      };
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
      const parseResult = z
        .object({
          skipBlockDialog: z.boolean(),
          hideBlockLinks: z.boolean(),
          hideControl: z.boolean(),
          enablePathDepth: z.boolean(),
          blockWholeSite: z.boolean().optional(),
        })
        .safeParse(parseJSON(cloudContent));
      if (!parseResult.success) {
        throw new Error(`File corrupted: ${SYNC_GENERAL_FILENAME}`);
      }
      const items = parseResult.data;
      return {
        ...cloudItems,
        skipBlockDialog: items.skipBlockDialog,
        hideBlockLinks: items.hideBlockLinks,
        hideControl: items.hideControl,
        enablePathDepth: items.enablePathDepth,
        ...(items.blockWholeSite != null
          ? { blockWholeSite: items.blockWholeSite }
          : {}),
        generalLastModified: cloudModifiedTime.toISOString(),
      };
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.generalLastModified != null &&
        dayjs(cloudItems.generalLastModified).isBefore(
          latestLocalItems.generalLastModified,
        )
      ) {
        const {
          skipBlockDialog,
          hideBlockLinks,
          hideControl,
          enablePathDepth,
          blockWholeSite,
          generalLastModified,
          ...newCloudItems
        } = cloudItems;
        return newCloudItems;
      }
      return { ...cloudItems };
    },
  },
  // appearance
  {
    beforeSync(items, dirtyFlags) {
      return {
        shouldUpload: (items.syncAppearance && dirtyFlags.appearance) || false,
      };
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
      const parseResult = z
        .object({
          linkColor: z.string(),
          blockColor: z.string(),
          highlightColors: z.string().array(),
          dialogTheme: z.enum(["light", "dark", "default"]),
        })
        .safeParse(parseJSON(cloudContent));
      if (!parseResult.success) {
        throw new Error(`File corrupted: ${SYNC_APPEARANCE_FILENAME}`);
      }
      const items = parseResult.data;
      return {
        ...cloudItems,
        linkColor: items.linkColor,
        blockColor: items.blockColor,
        highlightColors: items.highlightColors,
        dialogTheme: items.dialogTheme,
        appearanceLastModified: cloudModifiedTime.toISOString(),
      };
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.appearanceLastModified != null &&
        dayjs(cloudItems.appearanceLastModified).isBefore(
          latestLocalItems.appearanceLastModified,
        )
      ) {
        const {
          linkColor,
          blockColor,
          highlightColors,
          dialogTheme,
          appearanceLastModified,
          ...newCloudItems
        } = cloudItems;
        return newCloudItems;
      }
      return { ...cloudItems };
    },
  },
  // subscriptions
  {
    beforeSync(items, dirtyFlags) {
      return {
        shouldUpload:
          (items.syncSubscriptions && dirtyFlags.subscriptions) || false,
      };
    },
    beforeUpload(localItems) {
      return {
        filename: SYNC_SUBSCRIPTIONS_FILENAME,
        content: JSON.stringify(
          Object.values(localItems.subscriptions).map((s) => ({
            name: s.name,
            url: s.url,
            enabled: s.enabled ?? true,
          })),
        ),
        modifiedTime: dayjs(localItems.subscriptionsLastModified),
      };
    },
    afterDownload(cloudItems, cloudContent, cloudModifiedTime, localItems) {
      const parseResult = z
        .object({
          name: z.string(),
          url: z.string(),
          enabled: z.boolean().optional(),
        })
        .array()
        .safeParse(parseJSON(cloudContent));
      if (!parseResult.success) {
        throw new Error(`File corrupted: ${SYNC_SUBSCRIPTIONS_FILENAME}`);
      }
      const items = parseResult.data;
      const subscriptions: Subscriptions = {};
      let nextSubscriptionId = localItems.nextSubscriptionId;
      for (const { name, url, enabled } of items) {
        subscriptions[nextSubscriptionId++] = {
          name,
          url,
          blacklist: "",
          updateResult: null,
          enabled: enabled ?? true,
        };
      }
      return {
        ...cloudItems,
        subscriptions,
        nextSubscriptionId,
        subscriptionsLastModified: cloudModifiedTime.toISOString(),
      };
    },
    afterDownloadAll(cloudItems, latestLocalItems) {
      if (
        cloudItems.subscriptionsLastModified != null &&
        dayjs(cloudItems.subscriptionsLastModified).isBefore(
          latestLocalItems.subscriptionsLastModified,
        )
      ) {
        const {
          subscriptions,
          nextSubscriptionId,
          subscriptionsLastModified,
          ...newCloudItems
        } = cloudItems;
        return newCloudItems;
      }
      return { ...cloudItems };
    },
    afterSync(cloudItems) {
      if (
        cloudItems.subscriptions &&
        numberKeys(cloudItems.subscriptions).length
      ) {
        void updateAllSubscriptions();
      }
    },
  },
];

async function doSync(
  dirtyFlags: SyncDirtyFlags,
  repeat: boolean,
): Promise<void> {
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
      void browser.alarms.create(SYNC_ALARM_NAME, {
        periodInMinutes: localItems.syncInterval,
      });
    }

    let cloudItems: Partial<RawStorageItems> = {};
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
            const cloudFile = await syncFile(
              filename,
              localContent,
              localModifiedTime,
            );
            if (!cloudFile) {
              return;
            }
            cloudItems = section.afterDownload(
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

    postMessage("syncing", localItems.syncCloudId);

    let result: Result;
    try {
      await Promise.all(promises);
      await modifyAllInRawStorage((latestLocalItems) => {
        if (latestLocalItems.syncCloudId !== localItems.syncCloudId) {
          return {};
        }
        for (const section of syncSections) {
          cloudItems = section.afterDownloadAll(cloudItems, latestLocalItems);
        }
        return cloudItems;
      });
      for (const section of syncSections) {
        section.afterSync?.(cloudItems);
      }
      result = successResult();
    } catch (e: unknown) {
      result = errorResult(e instanceof Error ? e.message : "Unknown error");
    }
    await saveToRawStorage({ syncResult: result });

    postMessage(
      "synced",
      localItems.syncCloudId,
      result,
      Object.keys(cloudItems).length !== 0,
    );
  });
}

export function sync(): Promise<void> {
  return doSync(
    { blocklist: true, general: true, appearance: true, subscriptions: true },
    true,
  );
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

import { browser } from "../shared/browser.ts";
import { postMessage } from "../shared/messages.ts";
import type { Result, SyncForce } from "../shared/types.ts";
import { errorResult, Mutex, successResult } from "../shared/utilities.ts";
import {
  loadAllFromRawStorage,
  modifyAllInRawStorage,
  type RawStorageItems,
  saveToRawStorage,
} from "./raw-storage.ts";
import { syncFile } from "./sync-backends.ts";
import { type SyncDirtyFlags, syncSections } from "./sync-sections.ts";

export type { SyncDirtyFlags };

const SYNC_DELAY = 5; // in seconds

export const SYNC_ALARM_NAME = "sync";

const mutex = new Mutex();
let timeoutId: number | null = null;
let dirtyFlags: SyncDirtyFlags | null = null;

async function doSync(
  dirtyFlags: SyncDirtyFlags,
  repeat: boolean,
  force: SyncForce,
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
              force,
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
          cloudItems = section.afterDownloadAll(
            cloudItems,
            localItems,
            latestLocalItems,
          );
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

    postMessage("synced", localItems.syncCloudId, result);
  });
}

export function sync(force: SyncForce = "none"): Promise<void> {
  return doSync(
    {
      blocklist: true,
      general: true,
      appearance: true,
      subscriptions: true,
      serpInfo: true,
    },
    true,
    force,
  );
}

export function syncDelayed(dirtyFlagsUpdate: Partial<SyncDirtyFlags>): void {
  dirtyFlags = {
    ...(dirtyFlags || {
      blocklist: false,
      general: false,
      appearance: false,
      subscriptions: false,
      serpInfo: false,
    }),
    ...dirtyFlagsUpdate,
  };
  if (timeoutId != null) {
    self.clearTimeout(timeoutId);
  }
  timeoutId = self.setTimeout(() => {
    if (dirtyFlags) {
      void doSync(dirtyFlags, false, "none");
    }
    timeoutId = null;
    dirtyFlags = null;
  }, SYNC_DELAY * 1000);
}

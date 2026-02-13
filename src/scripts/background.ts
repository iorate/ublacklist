import dayjs from "dayjs";
import * as BackupRestore from "./background/backup-restore.ts";
import * as Clouds from "./background/clouds.ts";
import * as LocalStorage from "./background/local-storage.ts";
import { loadFromRawStorage } from "./background/raw-storage.ts";
import * as SearchEngines from "./background/search-engines.ts";
import * as Subscriptions from "./background/subscriptions.ts";
import * as Sync from "./background/sync.ts";
import { browser } from "./browser.ts";
import { addMessageListeners } from "./messages.ts";
import * as SerpInfo from "./serpinfo/background.ts";

function main() {
  addMessageListeners({
    "connect-to-cloud": Clouds.connect,
    "connect-to-webdav": Clouds.connectToWebDAV,
    "connect-to-git-repo": Clouds.connectToGitRepo,
    "connect-to-browser-sync": Clouds.connectToBrowserSync,
    "disconnect-from-cloud": Clouds.disconnect,

    "save-to-local-storage": LocalStorage.save,
    "add-subscription": LocalStorage.addSubscription,
    "remove-subscription": LocalStorage.removeSubscription,
    "enable-subscription": LocalStorage.enableSubscription,

    sync: Sync.sync,

    "update-subscription": Subscriptions.update,
    "update-all-subscriptions": Subscriptions.updateAll,

    "open-options-page": browser.runtime.openOptionsPage.bind(browser.runtime),

    "backup-settings": BackupRestore.backup,
    "restore-settings": BackupRestore.restore,
    "reset-settings": BackupRestore.reset,
  });

  const onStartup = () => {
    void LocalStorage.compileRules();
    void Sync.sync();
    void Subscriptions.updateAll();
    void SearchEngines.registerContentScripts();
    void SerpInfo.onStartup();
  };

  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== "install" && reason !== "update") {
      return;
    }
    onStartup();
  });

  browser.runtime.onStartup.addListener(() => {
    onStartup();
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === Sync.SYNC_ALARM_NAME) {
      void Sync.sync();
    } else if (alarm.name === Subscriptions.UPDATE_ALL_ALARM_NAME) {
      void Subscriptions.updateAll();
    }
  });

  if (process.env.BROWSER === "safari") {
    browser.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === browser.windows.WINDOW_ID_NONE) {
        return;
      }
      void (async () => {
        if (
          ((await browser.runtime.getPlatformInfo()).os as string) !== "ios"
        ) {
          return;
        }
        // Sync and update-all may be fired as expected. Wait for them to recreate alarms.
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const [syncAlarm, updateAllAlarm] = await Promise.all([
          browser.alarms.get(Sync.SYNC_ALARM_NAME),
          browser.alarms.get(Subscriptions.UPDATE_ALL_ALARM_NAME),
        ]);
        const now = dayjs();
        if (syncAlarm && dayjs(syncAlarm.scheduledTime).isBefore(now)) {
          void Sync.sync();
        }
        if (
          updateAllAlarm &&
          dayjs(updateAllAlarm.scheduledTime).isBefore(now)
        ) {
          void Subscriptions.updateAll();
        }
      })();
    });
  }

  // Trigger sync immediately after `browser.storage.sync` is changed
  browser.storage.sync?.onChanged.addListener(async () => {
    const { syncCloudId } = await loadFromRawStorage(["syncCloudId"]);
    if (syncCloudId === "browserSync") {
      await Sync.sync();
    }
  });

  SerpInfo.main();
}

main();

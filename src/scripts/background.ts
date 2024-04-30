import dayjs from "dayjs";
import * as BackupRestore from "./background/backup-restore.ts";
import * as Clouds from "./background/clouds.ts";
import * as LocalStorage from "./background/local-storage.ts";
import * as SearchEngines from "./background/search-engines.ts";
import * as Subscriptions from "./background/subscriptions.ts";
import * as Sync from "./background/sync.ts";
import * as Watch from "./background/watch.ts";
import { browser } from "./browser.ts";
import { addMessageListeners } from "./messages.ts";

function main() {
  addMessageListeners({
    "connect-to-cloud": Clouds.connect,
    "disconnect-from-cloud": Clouds.disconnect,

    "save-to-local-storage": LocalStorage.save,
    "add-subscription": LocalStorage.addSubscription,
    "remove-subscription": LocalStorage.removeSubscription,
    "enable-subscription": LocalStorage.enableSubscription,

    "register-content-scripts": SearchEngines.registerContentScripts,

    sync: Sync.sync,

    "update-subscription": Subscriptions.update,
    "update-all-subscriptions": Subscriptions.updateAll,

    "open-options-page": browser.runtime.openOptionsPage.bind(browser.runtime),

    "backup-settings": BackupRestore.backup,
    "restore-settings": BackupRestore.restore,
    "initialize-settings": BackupRestore.initialize,
  });

  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== "install" && reason !== "update") {
      return;
    }
    void LocalStorage.compileRules();
    void Sync.sync();
    void Subscriptions.updateAll();
    void SearchEngines.registerContentScripts();
    if (process.env.WATCH === "true" && process.env.BROWSER === "chrome") {
      void Watch.watch();
    }
  });

  browser.runtime.onStartup.addListener(() => {
    void LocalStorage.compileRules();
    void Sync.sync();
    void Subscriptions.updateAll();
    void SearchEngines.registerContentScripts();
    if (process.env.WATCH === "true" && process.env.BROWSER === "chrome") {
      void Watch.watch();
    }
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
}

main();

/* #if SAFARI
import dayjs from 'dayjs';
*/
// #endif
import * as Clouds from './background/clouds';
import * as LocalStorage from './background/local-storage';
import * as SearchEngines from './background/search-engines';
import * as Subscriptions from './background/subscriptions';
import * as Sync from './background/sync';
import { browser } from './browser';
import { addMessageListeners } from './messages';

function main() {
  addMessageListeners({
    'connect-to-cloud': Clouds.connect,
    'disconnect-from-cloud': Clouds.disconnect,

    'save-to-local-storage': LocalStorage.save,
    'add-subscription': LocalStorage.addSubscription,
    'remove-subscription': LocalStorage.removeSubscription,
    'enable-subscription': LocalStorage.enableSubscription,

    'register-content-scripts': SearchEngines.registerContentScripts,

    sync: Sync.sync,

    'update-subscription': Subscriptions.update,
    'update-all-subscriptions': Subscriptions.updateAll,

    'open-options-page': browser.runtime.openOptionsPage,
  });

  /* #if CHROME && !CHROME_MV3
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'loading' || tab.url == null) {
      return;
    }
    void SearchEngines.injectContentScript(tabId, tab.url);
  });
  */
  // #endif

  browser.runtime.onInstalled.addListener(() => {
    void LocalStorage.compileRules();
    void Sync.sync();
    void Subscriptions.updateAll();
  });

  browser.runtime.onStartup.addListener(() => {
    void LocalStorage.compileRules();
    void Sync.sync();
    void Subscriptions.updateAll();
  });

  browser.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === Sync.SYNC_ALARM_NAME) {
      void Sync.sync();
    } else if (alarm.name === Subscriptions.UPDATE_ALL_ALARM_NAME) {
      void Subscriptions.updateAll();
    }
  });

  /* #if SAFARI
  browser.windows.onFocusChanged.addListener(windowId => {
    if (windowId === browser.windows.WINDOW_ID_NONE) {
      return;
    }
    void (async () => {
      if ((await browser.runtime.getPlatformInfo()).os !== 'ios') {
        return;
      }
      // Sync and update-all may be fired as expected. Wait for them to recreate alarms.
      await new Promise(resolve => setTimeout(resolve, 5000));
      const [syncAlarm, updateAllAlarm] = await Promise.all([
        browser.alarms.get(Sync.SYNC_ALARM_NAME),
        browser.alarms.get(Subscriptions.UPDATE_ALL_ALARM_NAME),
      ]);
      const now = dayjs();
      if (syncAlarm && dayjs(syncAlarm.scheduledTime).isBefore(now)) {
        void Sync.sync();
      }
      if (updateAllAlarm && dayjs(updateAllAlarm.scheduledTime).isBefore(now)) {
        void Subscriptions.updateAll();
      }
    })();
  });
  */
  // #endif

  void SearchEngines.registerContentScripts();
}

main();

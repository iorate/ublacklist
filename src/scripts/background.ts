import { apis } from './apis';
import * as Blacklist from './background/blacklist';
import * as Clouds from './background/clouds';
import * as SearchEngines from './background/search-engines';
import * as Subscriptions from './background/subscriptions';
import * as LocalStorage from './local-storage';
import { SetBlacklistSource, addMessageListeners } from './messages';
import { CloudId, Subscription, SubscriptionId } from './types';

const SYNC_BLACKLIST_ALARM_NAME = 'sync-blacklist';
const UPDATE_ALL_SUBSCRIPTIONS_ALARM_NAME = 'update-all-subscriptions';

async function setBlacklist(blacklist: string, source: SetBlacklistSource): Promise<void> {
  await Blacklist.set(blacklist, source);
  void syncBlacklist();
}

async function syncBlacklist(): Promise<void> {
  const { interval } = await Blacklist.sync();
  if (interval != null) {
    apis.alarms.create(SYNC_BLACKLIST_ALARM_NAME, { delayInMinutes: interval });
  }
}

async function connectToCloud(id: CloudId): Promise<boolean> {
  const connected = await Clouds.connect(id);
  void syncBlacklist();
  return connected;
}

async function addSubscription(subscription: Subscription): Promise<SubscriptionId> {
  const { id, single } = await Subscriptions.add(subscription);
  if (single) {
    void updateAllSubscriptions();
  } else {
    void Subscriptions.update(id);
  }
  return id;
}

async function updateAllSubscriptions(): Promise<void> {
  const { interval } = await Subscriptions.updateAll();
  if (interval != null) {
    apis.alarms.create(UPDATE_ALL_SUBSCRIPTIONS_ALARM_NAME, { delayInMinutes: interval });
  }
}

function main() {
  apis.runtime.onInstalled.addListener(details => {
    void syncBlacklist();
    void updateAllSubscriptions();
    if (details.reason === 'update') {
      // If sync was turned on in version <= 3.8.4, notify that the sync feature has been updated.
      void (async () => {
        const { sync } = await LocalStorage.load(['sync']);
        if (sync) {
          await apis.runtime.openOptionsPage();
        }
      })();
    }
  });

  apis.runtime.onStartup.addListener(() => {
    void syncBlacklist();
    void updateAllSubscriptions();
  });

  apis.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === SYNC_BLACKLIST_ALARM_NAME) {
      void syncBlacklist();
    } else if (alarm.name === UPDATE_ALL_SUBSCRIPTIONS_ALARM_NAME) {
      void updateAllSubscriptions();
    }
  });

  addMessageListeners({
    'set-blacklist': setBlacklist,
    'sync-blacklist': syncBlacklist,
    'connect-to-cloud': connectToCloud,
    'disconnect-from-cloud': Clouds.disconnect,
    'add-subscription': addSubscription,
    'register-search-engine': SearchEngines.register,
    'remove-subscription': Subscriptions.remove,
    'update-subscription': Subscriptions.update,
    'update-all-subscriptions': updateAllSubscriptions,
    'open-options-page': apis.runtime.openOptionsPage.bind(apis.runtime),
  });

  void SearchEngines.registerAll();
}

main();

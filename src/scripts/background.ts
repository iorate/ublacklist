import { apis } from './apis';
import * as Blacklist from './background/blacklist';
import * as Clouds from './background/clouds';
import * as SearchEngines from './background/search-engines';
import * as Subscriptions from './background/subscriptions';
import { SetBlacklistSource, addMessageListeners } from './messages';
import { CloudId, Subscription, SubscriptionId } from './types';

const SYNC_BLACKLIST_ALARM_NAME = 'sync-blacklist';
const UPDATE_ALL_SUBSCRIPTIONS_ALARM_NAME = 'update-all-subscriptions';

async function setBlacklist(blacklist: string, source: SetBlacklistSource): Promise<void> {
  await Blacklist.set(blacklist, source);
  syncBlacklist();
}

async function syncBlacklist(): Promise<void> {
  const { interval } = await Blacklist.sync();
  if (interval != null) {
    apis.alarms.create(SYNC_BLACKLIST_ALARM_NAME, { delayInMinutes: interval });
  }
}

async function connectToCloud(id: CloudId): Promise<boolean> {
  const connected = await Clouds.connect(id);
  syncBlacklist();
  return connected;
}

async function addSubscription(subscription: Subscription): Promise<SubscriptionId> {
  const { id, single } = await Subscriptions.add(subscription);
  if (single) {
    updateAllSubscriptions();
  } else {
    Subscriptions.update(id);
  }
  return id;
}

async function updateAllSubscriptions(): Promise<void> {
  const { interval } = await Subscriptions.updateAll();
  if (interval != null) {
    apis.alarms.create(UPDATE_ALL_SUBSCRIPTIONS_ALARM_NAME, { delayInMinutes: interval });
  }
}

apis.runtime.onInstalled.addListener(() => {
  syncBlacklist();
  updateAllSubscriptions();
});
apis.runtime.onStartup.addListener(() => {
  syncBlacklist();
  updateAllSubscriptions();
});
apis.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === SYNC_BLACKLIST_ALARM_NAME) {
    syncBlacklist();
  } else if (alarm.name === UPDATE_ALL_SUBSCRIPTIONS_ALARM_NAME) {
    updateAllSubscriptions();
  }
});

SearchEngines.registerAll();

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
});

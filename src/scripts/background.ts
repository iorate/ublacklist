import { apis } from './apis';
import { addMessageListeners } from './messages';
import { authToSyncBlacklist, setBlacklist, syncBlacklist } from './background/blacklist';
import {
  addSubscription,
  removeSubscription,
  updateSubscription,
  updateSubscriptions,
} from './background/subscriptions';
import { enableOnEngine, enableOnEngines } from './background/engines';

addMessageListeners({
  'auth-to-sync-blacklist': authToSyncBlacklist,
  'set-blacklist': setBlacklist,
  'sync-blacklist': syncBlacklist,
  'add-subscription': addSubscription,
  'remove-subscription': removeSubscription,
  'update-subscription': updateSubscription,
  'update-subscriptions': updateSubscriptions,
  'enable-on-engine': enableOnEngine,
});

apis.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'sync-blacklist') {
    syncBlacklist();
  } else if (alarm.name === 'update-subscriptions') {
    updateSubscriptions();
  }
});
apis.runtime.onInstalled.addListener(() => {
  syncBlacklist();
  updateSubscriptions();
});
apis.runtime.onStartup.addListener(() => {
  syncBlacklist();
  updateSubscriptions();
});

enableOnEngines();

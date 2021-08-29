import { apis } from './apis';
import * as Clouds from './background/clouds';
import * as LocalStorage from './background/local-storage';
import * as SearchEngines from './background/search-engines';
import * as Subscriptions from './background/subscriptions';
import * as Sync from './background/sync';
import { addMessageListeners } from './messages';

function main() {
  addMessageListeners({
    'connect-to-cloud': Clouds.connect,
    'disconnect-from-cloud': Clouds.disconnect,

    'save-to-local-storage': LocalStorage.save,
    'add-subscription': LocalStorage.addSubscription,
    'remove-subscription': LocalStorage.removeSubscription,

    'register-search-engine': SearchEngines.register,

    sync: Sync.sync,

    'update-subscription': Subscriptions.update,
    'update-all-subscriptions': Subscriptions.updateAll,

    'open-options-page': apis.runtime.openOptionsPage.bind(apis.runtime),
  });

  SearchEngines.initialize();
  Sync.initialize();
  Subscriptions.initialize();
}

main();

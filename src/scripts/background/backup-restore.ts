import dayjs from 'dayjs';
import { SEARCH_ENGINES } from '../../common/search-engines';
import { browser } from '../browser';
import { defaultLocalStorageItems, loadFromLocalStorage } from '../local-storage';
import { Ruleset } from '../ruleset';
import { LocalStorageItemsBackupRestore, Subscriptions } from '../types';
import { stringEntries } from '../utilities';
import { resetAllInRawStorage } from './raw-storage';
import { updateAll as updateAllSubscriptions } from './subscriptions';

export async function backup(): Promise<LocalStorageItemsBackupRestore> {
  const items = await loadFromLocalStorage([
    'blacklist',
    'blockWholeSite',
    'skipBlockDialog',
    'hideBlockLinks',
    'hideControl',
    'enablePathDepth',
    'linkColor',
    'blockColor',
    'highlightColors',
    'dialogTheme',
    'syncBlocklist',
    'syncGeneral',
    'syncAppearance',
    'syncSubscriptions',
    'syncInterval',
    'subscriptions',
    'updateInterval',
  ]);
  return {
    ...items,
    subscriptions: Object.values(items.subscriptions).map(s => ({
      name: s.name,
      url: s.url,
      enabled: s.enabled ?? true,
    })),
  };
}

export async function restore(
  items: Readonly<Partial<LocalStorageItemsBackupRestore>>,
): Promise<void> {
  await resetAllInRawStorage(({ nextSubscriptionId }) => {
    const defaults = defaultLocalStorageItems;
    const now = dayjs().toISOString();

    const blacklist = items.blacklist ?? defaults.blacklist;
    const compiledRules = Ruleset.compile(blacklist);

    const subscriptions: Subscriptions = {};
    for (const { name, url, enabled } of items.subscriptions ||
      Object.values(defaults.subscriptions)) {
      subscriptions[nextSubscriptionId] = {
        name,
        url,
        blacklist: '',
        compiledRules: Ruleset.compile(''),
        updateResult: false,
        enabled: enabled ?? true,
      };
      ++nextSubscriptionId;
    }

    return {
      blacklist,
      compiledRules,
      timestamp: now,

      blockWholeSite: items.blockWholeSite ?? defaults.blockWholeSite,
      skipBlockDialog: items.skipBlockDialog ?? defaults.skipBlockDialog,
      hideBlockLinks: items.hideBlockLinks ?? defaults.hideBlockLinks,
      hideControl: items.hideControl ?? defaults.hideControl,
      enablePathDepth: items.enablePathDepth ?? defaults.enablePathDepth,
      generalLastModified: now,

      linkColor: items.linkColor ?? defaults.linkColor,
      blockColor: items.blockColor ?? defaults.blockColor,
      highlightColors: items.highlightColors ?? defaults.highlightColors,
      dialogTheme: items.dialogTheme ?? defaults.dialogTheme,
      appearanceLastModified: now,

      // Disable sync.
      syncCloudId: false,
      syncCloudToken: false,
      syncResult: false,
      syncBlocklist: items.syncBlocklist ?? defaults.syncBlocklist,
      syncGeneral: items.syncGeneral ?? defaults.syncGeneral,
      syncAppearance: items.syncAppearance ?? defaults.syncAppearance,
      syncSubscriptions: items.syncSubscriptions ?? defaults.syncSubscriptions,
      syncInterval: items.syncInterval ?? defaults.syncInterval,

      subscriptions,
      nextSubscriptionId,
      updateInterval: items.updateInterval ?? defaults.updateInterval,
      subscriptionsLastModified: now,
    };
  });

  void updateAllSubscriptions();
}

export async function initialize(): Promise<void> {
  await resetAllInRawStorage(() => ({}));

  // #if !SAFARI
  const matches = stringEntries(SEARCH_ENGINES).flatMap(([id, { contentScripts }]) =>
    id !== 'google' ? contentScripts.flatMap(({ matches }) => matches) : [],
  );
  await browser.permissions.remove({ origins: matches });
  // #endif
}

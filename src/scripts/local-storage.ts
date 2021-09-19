import { apis } from './apis';
import { sendMessage } from './messages';
import {
  LocalStorageItems,
  LocalStorageItemsFor,
  LocalStorageItemsSavable,
  SaveSource,
} from './types';

export const defaultLocalStorageItems: Readonly<LocalStorageItems> = {
  blacklist: '',
  skipBlockDialog: false,
  hideBlockLinks: false,
  hideControl: false,
  enablePathDepth: false,

  linkColor: 'default',
  blockColor: 'default',
  highlightColors: ['#ddeeff'],
  dialogTheme: 'default',

  syncCloudId: false,
  syncBlocklist: true,
  syncGeneral: false,
  syncAppearance: false,
  syncSubscriptions: false,
  syncResult: false,
  syncInterval: 15,

  subscriptions: {},
  updateInterval: 120,
};

export function loadFromLocalStorage<Keys extends (keyof LocalStorageItems)[]>(
  keys: Readonly<Keys>,
): Promise<LocalStorageItemsFor<Keys>> {
  const defaultItemsForKeys: Partial<Record<keyof LocalStorageItems, unknown>> = {};
  for (const key of keys) {
    defaultItemsForKeys[key] = defaultLocalStorageItems[key];
  }
  return apis.storage.local.get(defaultItemsForKeys) as Promise<LocalStorageItemsFor<Keys>>;
}

export function loadAllFromLocalStorage(): Promise<LocalStorageItems> {
  return apis.storage.local.get(defaultLocalStorageItems) as Promise<LocalStorageItems>;
}

export function saveToLocalStorage<Items extends Partial<LocalStorageItemsSavable>>(
  items: Exclude<keyof Items, keyof LocalStorageItemsSavable> extends never
    ? Readonly<Items>
    : never,
  source: SaveSource,
): Promise<void> {
  return sendMessage('save-to-local-storage', items, source);
}

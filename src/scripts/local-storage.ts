import { apis } from './apis';
import { sendMessage } from './messages';
import { LocalStorageItems, LocalStorageItemsFor, SaveSource } from './types';

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

  syncCloudId: null,
  syncBlocklist: true,
  syncGeneral: false,
  syncAppearance: false,
  syncSubscriptions: false,
  syncResult: null,
  syncInterval: 15,

  subscriptions: {},
  updateInterval: 120,
};

export function loadFromLocalStorage<T extends readonly (keyof LocalStorageItems)[]>(
  keys: T,
): Promise<LocalStorageItemsFor<T>> {
  const defaultItemsForKeys: Partial<Record<keyof LocalStorageItems, unknown>> = {};
  for (const key of keys) {
    defaultItemsForKeys[key] = defaultLocalStorageItems[key];
  }
  return apis.storage.local.get(defaultItemsForKeys) as Promise<LocalStorageItemsFor<T>>;
}

export function loadAllFromLocalStorage(): Promise<LocalStorageItems> {
  return apis.storage.local.get(defaultLocalStorageItems) as Promise<LocalStorageItems>;
}

export function saveToLocalStorage(
  items: Readonly<Partial<LocalStorageItems>>,
  source: SaveSource,
): Promise<void> {
  return sendMessage('save-to-local-storage', items, source);
}

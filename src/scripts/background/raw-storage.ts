import dayjs from 'dayjs';
import { apis } from '../apis';
import { defaultLocalStorageItems } from '../local-storage';
import { CloudToken, LocalStorageItems, SubscriptionId } from '../types';
import { Mutex } from '../utilities';

export type RawStorageItems = LocalStorageItems & {
  timestamp: string;
  generalLastModified: string;
  appearanceLastModified: string;
  sync: boolean; // unused
  syncCloudToken: CloudToken | null;
  nextSubscriptionId: SubscriptionId;
  subscriptionsLastModified: string;
};

export type RawStorageItemsFor<T extends readonly (keyof RawStorageItems)[]> = {
  [Key in T[number]]: RawStorageItems[Key];
};

const timeZero = dayjs(0).toISOString();

const defaultRawStorageItems: Readonly<RawStorageItems> = {
  ...defaultLocalStorageItems,
  timestamp: timeZero,
  generalLastModified: timeZero,
  sync: false,
  syncCloudToken: null,
  appearanceLastModified: timeZero,
  nextSubscriptionId: 0,
  subscriptionsLastModified: timeZero,
};

const mutex = new Mutex();

export function loadFromRawStorage<T extends readonly (keyof RawStorageItems)[]>(
  keys: T,
): Promise<RawStorageItemsFor<T>> {
  const defaultItemsForKeys: Partial<Record<keyof RawStorageItems, unknown>> = {};
  for (const key of keys) {
    defaultItemsForKeys[key] = defaultRawStorageItems[key];
  }
  return apis.storage.local.get(defaultItemsForKeys) as Promise<RawStorageItemsFor<T>>;
}

export function loadAllFromRawStorage(): Promise<RawStorageItems> {
  return apis.storage.local.get(defaultRawStorageItems) as Promise<RawStorageItems>;
}

export function saveToRawStorage(items: Readonly<Partial<RawStorageItems>>): Promise<void> {
  return mutex.lock(() => apis.storage.local.set(items));
}

export function modifyInRawStorage<T extends readonly (keyof RawStorageItems)[]>(
  keys: T,
  callback: (items: Readonly<RawStorageItemsFor<T>>) => Partial<RawStorageItems>,
): Promise<void> {
  return mutex.lock(async () => {
    const oldItems = await loadFromRawStorage(keys);
    const newItems = callback(oldItems);
    await apis.storage.local.set(newItems);
  });
}

export function modifyAllInRawStorage(
  callback: (items: Readonly<RawStorageItems>) => Partial<RawStorageItems>,
): Promise<void> {
  return mutex.lock(async () => {
    const oldItems = await loadAllFromRawStorage();
    const newItems = callback(oldItems);
    await apis.storage.local.set(newItems);
  });
}

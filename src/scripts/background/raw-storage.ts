import dayjs from "dayjs";
import { browser } from "../browser.ts";
import { defaultLocalStorageItems } from "../local-storage.ts";
import type {
  CloudToken,
  LocalStorageItems,
  SubscriptionId,
} from "../types.ts";
import { Mutex } from "../utilities.ts";

export type RawStorageItems = LocalStorageItems & {
  timestamp: string;
  generalLastModified: string;
  appearanceLastModified: string;
  sync: boolean; // unused
  syncCloudToken: CloudToken | false | null;
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
  syncCloudToken: false,
  appearanceLastModified: timeZero,
  nextSubscriptionId: 0,
  subscriptionsLastModified: timeZero,
};

const mutex = new Mutex();

export function loadFromRawStorage<
  T extends readonly (keyof RawStorageItems)[],
>(keys: T): Promise<RawStorageItemsFor<T>> {
  const defaultItemsForKeys: Partial<Record<keyof RawStorageItems, unknown>> =
    {};
  for (const key of keys) {
    defaultItemsForKeys[key] = defaultRawStorageItems[key];
  }
  return browser.storage.local.get(defaultItemsForKeys) as Promise<
    RawStorageItemsFor<T>
  >;
}

export function loadAllFromRawStorage(): Promise<RawStorageItems> {
  return browser.storage.local.get(
    defaultRawStorageItems,
  ) as Promise<RawStorageItems>;
}

export function saveToRawStorage<Items extends Partial<RawStorageItems>>(
  items: Exclude<keyof Items, keyof RawStorageItems> extends never
    ? Readonly<Items>
    : never,
): Promise<void> {
  return mutex.lock(() => browser.storage.local.set(items));
}

export function modifyInRawStorage<
  Keys extends (keyof RawStorageItems)[],
  Items extends Partial<RawStorageItems>,
>(
  keys: Readonly<Keys>,
  callback: Exclude<keyof Items, keyof RawStorageItems> extends never
    ? (items: Readonly<RawStorageItemsFor<Keys>>) => Items
    : never,
): Promise<void> {
  return mutex.lock(async () => {
    const oldItems = await loadFromRawStorage(keys);
    const newItems = callback(oldItems);
    await browser.storage.local.set(newItems);
  });
}

export function modifyAllInRawStorage<Items extends Partial<RawStorageItems>>(
  callback: Exclude<keyof Items, keyof RawStorageItems> extends never
    ? (items: Readonly<RawStorageItems>) => Items
    : never,
): Promise<void> {
  return mutex.lock(async () => {
    const oldItems = await loadAllFromRawStorage();
    const newItems = callback(oldItems);
    await browser.storage.local.set(newItems);
  });
}

export function resetAllInRawStorage<Items extends Partial<RawStorageItems>>(
  callback: Exclude<keyof Items, keyof RawStorageItems> extends never
    ? (items: Readonly<RawStorageItems>) => Items
    : never,
): Promise<void> {
  return mutex.lock(async () => {
    const oldItems = await loadAllFromRawStorage();
    const newItems = callback(oldItems);
    await browser.storage.local.clear();
    await browser.storage.local.set(newItems);
  });
}

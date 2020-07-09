import dayjs from 'dayjs';
import { apis } from './apis';
import { CloudId, CloudToken, Result, SubscriptionId, Subscriptions } from './types';

export type Items = {
  blacklist: string;
  enablePathDepth: boolean;
  hideBlockLinks: boolean;
  hideControl: boolean;
  nextSubscriptionId: SubscriptionId;
  skipBlockDialog: boolean;
  subscriptions: Subscriptions;
  sync: boolean; // sync was turned on in version <= 3
  syncCloudId: CloudId | null;
  syncCloudToken: CloudToken | null;
  syncInterval: number;
  syncResult: Result | null;
  timestamp: string;
  updateInterval: number;
};

const defaultItems: Items = {
  blacklist: '',
  enablePathDepth: false,
  hideBlockLinks: false,
  hideControl: false,
  nextSubscriptionId: 0,
  skipBlockDialog: false,
  subscriptions: {},
  sync: false,
  syncCloudId: null,
  syncCloudToken: null,
  syncInterval: 15,
  syncResult: null,
  timestamp: dayjs(0).toISOString(),
  updateInterval: 120,
};

export type ItemsFor<T extends readonly (keyof Items)[]> = { [Key in T[number]]: Items[Key] };

export async function load<T extends readonly (keyof Items)[]>(keys: T): Promise<ItemsFor<T>> {
  const defaultItemsForKeys = {} as Record<keyof Items, unknown>;
  for (const key of keys) {
    defaultItemsForKeys[key] = defaultItems[key];
  }
  return (await apis.storage.local.get(defaultItemsForKeys)) as ItemsFor<T>;
}

export async function loadAll(): Promise<Items> {
  return (await apis.storage.local.get(defaultItems)) as Items;
}

export async function store<T extends Partial<Items>>(items: T): Promise<void> {
  await apis.storage.local.set(items);
}

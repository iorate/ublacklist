import dayjs from 'dayjs';
import { apis } from './apis';
import { CloudId, CloudToken, Result, SubscriptionId, Subscriptions } from './types';

export type Items = {
  // general
  blacklist: string;
  timestamp: string;
  skipBlockDialog: boolean;
  hideBlockLinks: boolean;
  hideControl: boolean;
  enablePathDepth: boolean;

  // sync
  syncCloudId: CloudId | null;
  syncCloudToken: CloudToken | null;
  syncInterval: number;
  syncResult: Result | null;

  // subscription
  subscriptions: Subscriptions;
  nextSubscriptionId: SubscriptionId;
  updateInterval: number;

  // appearance
  linkColor: string | null;
  blockColor: string | null;
  highlightColors: string[];
  dialogTheme: 'light' | 'dark' | null;

  // unused
  sync: boolean;
};

const defaultItems: Items = {
  blacklist: '',
  timestamp: dayjs(0).toISOString(),
  skipBlockDialog: false,
  hideBlockLinks: false,
  hideControl: false,
  enablePathDepth: false,

  syncCloudId: null,
  syncCloudToken: null,
  syncInterval: 15,
  syncResult: null,

  subscriptions: {},
  nextSubscriptionId: 0,
  updateInterval: 120,

  linkColor: null,
  blockColor: null,
  highlightColors: ['#ddeeff'],
  dialogTheme: null,

  sync: false,
};

export type ItemsFor<T extends readonly (keyof Items)[]> = { [Key in T[number]]: Items[Key] };

export async function load<T extends readonly (keyof Items)[]>(keys: T): Promise<ItemsFor<T>> {
  const defaultItemsForKeys: Partial<Record<keyof Items, unknown>> = {};
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

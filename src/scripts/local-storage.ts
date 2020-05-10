import dayjs from 'dayjs';
import { apis } from './apis';
import { ISOString, Minutes, Result, SubscriptionId, Subscriptions, TokenCache } from './types';

export interface Items {
  blacklist: string;
  enablePathDepth: boolean;
  hideBlockLinks: boolean;
  hideControl: boolean;
  skipBlockDialog: boolean;
  nextSubscriptionId: SubscriptionId;
  subscriptions: Subscriptions;
  sync: boolean;
  syncInterval: Minutes;
  syncResult: Result | null;
  timestamp: ISOString;
  tokenCache: TokenCache | null;
  updateInterval: Minutes;
}

const defaultItems: Items = {
  blacklist: '',
  enablePathDepth: false,
  hideBlockLinks: false,
  hideControl: false,
  skipBlockDialog: false,
  nextSubscriptionId: 0,
  subscriptions: {},
  sync: false,
  syncInterval: 5,
  syncResult: null,
  timestamp: dayjs(0).toISOString(),
  tokenCache: null,
  updateInterval: 60,
};

export type ItemsFor<T extends (keyof Items)[]> = { [Key in T[number]]: Items[Key] };

export async function load<T extends (keyof Items)[]>(...keys: T): Promise<ItemsFor<T>> {
  const defaultItemsForKeys = {} as Record<keyof Items, unknown>;
  for (const key of keys) {
    defaultItemsForKeys[key] = defaultItems[key];
  }
  return (await apis.storage.local.get(defaultItemsForKeys)) as ItemsFor<T>;
}

export async function store<T extends Partial<Items>>(items: T): Promise<void> {
  await apis.storage.local.set(items);
}

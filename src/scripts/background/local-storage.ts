import dayjs from 'dayjs';
import { postMessage } from '../messages';
import { LocalStorageItemsSavable, SaveSource, Subscription, SubscriptionId } from '../types';
import { RawStorageItems, modifyInRawStorage, saveToRawStorage } from './raw-storage';
import { update as updateSubscription } from './subscriptions';
import { SyncDirtyFlags, syncDelayed } from './sync';

type LocalStorageSection = {
  beforeSave(
    items: Partial<RawStorageItems>,
    syncDirtyFlags: SyncDirtyFlags,
    now: dayjs.Dayjs,
  ): void;
  afterSave?(items: Partial<RawStorageItems>, source: SaveSource): void;
};

const localStorageSections: readonly LocalStorageSection[] = [
  // blocklist
  {
    beforeSave(items, syncDirtyFlags, now) {
      if (items.blacklist != null) {
        items.timestamp = now.toISOString();
        syncDirtyFlags.blocklist = true;
      }
    },
    afterSave(items, source) {
      if (items.blacklist != null) {
        postMessage('blocklist-saved', items.blacklist, source);
      }
    },
  },
  // general
  {
    beforeSave(items, syncDirtyFlags, now) {
      if (
        items.skipBlockDialog != null ||
        items.hideBlockLinks != null ||
        items.hideControl != null ||
        items.enablePathDepth != null
      ) {
        items.generalLastModified = now.toISOString();
        syncDirtyFlags.general = true;
      }
    },
  },
  // appearance
  {
    beforeSave(items, syncDirtyFlags, now) {
      if (
        items.linkColor != null ||
        items.blockColor != null ||
        items.highlightColors ||
        items.dialogTheme != null
      ) {
        items.appearanceLastModified = now.toISOString();
        syncDirtyFlags.appearance = true;
      }
    },
  },
];

export async function save(
  items: Readonly<Partial<LocalStorageItemsSavable>>,
  source: SaveSource,
): Promise<void> {
  const syncDirtyFlags: SyncDirtyFlags = {};
  const now = dayjs();
  for (const section of localStorageSections) {
    section.beforeSave(items, syncDirtyFlags, now);
  }
  await saveToRawStorage(items);
  for (const section of localStorageSections) {
    section.afterSave?.(items, source);
  }
  syncDelayed(syncDirtyFlags);
}

export async function addSubscription(subscription: Subscription): Promise<SubscriptionId> {
  let id!: SubscriptionId;
  await modifyInRawStorage(
    ['subscriptions', 'nextSubscriptionId'],
    ({ subscriptions, nextSubscriptionId }) => {
      id = nextSubscriptionId;
      return {
        subscriptions: { ...subscriptions, [nextSubscriptionId]: subscription },
        nextSubscriptionId: nextSubscriptionId + 1,
        subscriptionsLastModified: dayjs().toISOString(),
      };
    },
  );
  syncDelayed({ subscriptions: true });
  void updateSubscription(id);
  return id;
}

export async function removeSubscription(id: SubscriptionId): Promise<void> {
  await modifyInRawStorage(['subscriptions'], ({ subscriptions }) => {
    const newSubscriptions = { ...subscriptions };
    delete newSubscriptions[id];
    return { subscriptions: newSubscriptions, subscriptionsLastModified: dayjs().toISOString() };
  });
  syncDelayed({ subscriptions: true });
}

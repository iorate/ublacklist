import dayjs from "dayjs";
import { postMessage } from "../messages.ts";
import type {
  LocalStorageItemsSavable,
  SaveSource,
  Subscription,
  SubscriptionId,
} from "../types.ts";
import { numberKeys, toPlainRuleset } from "../utilities.ts";
import {
  type RawStorageItems,
  modifyInRawStorage,
  saveToRawStorage,
} from "./raw-storage.ts";
import {
  updateAll as updateAllSubscriptions,
  update as updateSubscription,
} from "./subscriptions.ts";
import { type SyncDirtyFlags, syncDelayed } from "./sync.ts";

type LocalStorageSection = {
  beforeSave(
    items: Partial<RawStorageItems>,
    dirtyFlagsUpdate: Partial<SyncDirtyFlags>,
    now: dayjs.Dayjs,
  ): void;
  afterSave?(items: Partial<RawStorageItems>, source: SaveSource): void;
};

const localStorageSections: readonly LocalStorageSection[] = [
  // blocklist
  {
    beforeSave(items, dirtyFlagsUpdate, now) {
      if (items.blacklist != null) {
        items.ruleset = toPlainRuleset(items.blacklist);
        items.timestamp = now.toISOString();
        dirtyFlagsUpdate.blocklist = true;
      }
    },
    afterSave(items, source) {
      if (items.blacklist != null) {
        postMessage("blocklist-saved", items.blacklist, source);
      }
    },
  },
  // general
  {
    beforeSave(items, dirtyFlagsUpdate, now) {
      if (
        items.skipBlockDialog != null ||
        items.hideBlockLinks != null ||
        items.hideControl != null ||
        items.enablePathDepth != null ||
        items.blockWholeSite != null
      ) {
        items.generalLastModified = now.toISOString();
        dirtyFlagsUpdate.general = true;
      }
    },
  },
  // appearance
  {
    beforeSave(items, dirtyFlagsUpdate, now) {
      if (
        items.linkColor != null ||
        items.blockColor != null ||
        items.highlightColors ||
        items.dialogTheme != null
      ) {
        items.appearanceLastModified = now.toISOString();
        dirtyFlagsUpdate.appearance = true;
      }
    },
  },
];

export async function save(
  items: Readonly<Partial<LocalStorageItemsSavable>>,
  source: SaveSource,
): Promise<void> {
  const dirtyFlagsUpdate: Partial<SyncDirtyFlags> = {};
  const now = dayjs();
  for (const section of localStorageSections) {
    section.beforeSave(items, dirtyFlagsUpdate, now);
  }
  await saveToRawStorage(items);
  for (const section of localStorageSections) {
    section.afterSave?.(items, source);
  }
  syncDelayed(dirtyFlagsUpdate);
}

export async function compileRules(): Promise<void> {
  return modifyInRawStorage(["blacklist"], ({ blacklist }) => ({
    ruleset: toPlainRuleset(blacklist),
    compiledRules: false,
  }));
}

export async function addSubscription(
  subscription: Subscription,
): Promise<SubscriptionId> {
  let id!: SubscriptionId;
  let first!: boolean;
  await modifyInRawStorage(
    ["subscriptions", "nextSubscriptionId"],
    ({ subscriptions, nextSubscriptionId }) => {
      id = nextSubscriptionId;
      first = numberKeys(subscriptions).length === 0;
      return {
        subscriptions: { ...subscriptions, [nextSubscriptionId]: subscription },
        nextSubscriptionId: nextSubscriptionId + 1,
        subscriptionsLastModified: dayjs().toISOString(),
      };
    },
  );
  syncDelayed({ subscriptions: true });
  if (first) {
    void updateAllSubscriptions();
  } else {
    void updateSubscription(id);
  }
  return id;
}

export async function removeSubscription(id: SubscriptionId): Promise<void> {
  await modifyInRawStorage(["subscriptions"], ({ subscriptions }) => {
    const newSubscriptions = { ...subscriptions };
    delete newSubscriptions[id];
    return {
      subscriptions: newSubscriptions,
      subscriptionsLastModified: dayjs().toISOString(),
    };
  });
  syncDelayed({ subscriptions: true });
}

export async function enableSubscription(
  id: SubscriptionId,
  enabled: boolean,
): Promise<void> {
  await modifyInRawStorage(["subscriptions"], ({ subscriptions }) => {
    const newSubscriptions = { ...subscriptions };
    if (subscriptions[id]) {
      newSubscriptions[id] = { ...subscriptions[id], enabled };
    }
    return {
      subscriptions: newSubscriptions,
      subscriptionsLastModified: dayjs().toISOString(),
    };
  });
  syncDelayed({ subscriptions: true });
}

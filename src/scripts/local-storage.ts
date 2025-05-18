import { browser } from "./browser.ts";
import { sendMessage } from "./messages.ts";
import { getDefault } from "./serpinfo/settings.ts";
import type {
  LocalStorageItems,
  LocalStorageItemsFor,
  LocalStorageItemsSavable,
  SaveSource,
} from "./types.ts";

export const defaultLocalStorageItems: Readonly<LocalStorageItems> = {
  ruleset: false,
  blacklist: "",
  compiledRules: false,
  skipBlockDialog: false,
  hideBlockLinks: false,
  hideControl: false,
  enablePathDepth: false,
  enableMatchingRules: false,
  blockWholeSite: false,

  linkColor: "default",
  blockColor: "default",
  highlightColors: ["#ddeeff"],
  dialogTheme: "default",

  syncCloudId: false,
  syncBlocklist: true,
  syncGeneral: false,
  syncAppearance: false,
  syncSubscriptions: false,
  syncSerpInfo: false,
  syncResult: false,
  syncInterval: 15,

  subscriptions: {},
  updateInterval: 120,

  serpInfoSettings: getDefault(),
};

export function loadFromLocalStorage<Keys extends (keyof LocalStorageItems)[]>(
  keys: Readonly<Keys>,
): Promise<LocalStorageItemsFor<Keys>> {
  const defaultItemsForKeys: Partial<Record<keyof LocalStorageItems, unknown>> =
    {};
  for (const key of keys) {
    defaultItemsForKeys[key] = defaultLocalStorageItems[key];
  }
  return browser.storage.local.get(defaultItemsForKeys) as Promise<
    LocalStorageItemsFor<Keys>
  >;
}

export function loadAllFromLocalStorage(): Promise<LocalStorageItems> {
  return browser.storage.local.get(
    defaultLocalStorageItems,
  ) as Promise<LocalStorageItems>;
}

export function saveToLocalStorage<
  Items extends Partial<LocalStorageItemsSavable>,
>(
  items: Exclude<keyof Items, keyof LocalStorageItemsSavable> extends never
    ? Readonly<Items>
    : never,
  source: SaveSource,
): Promise<void> {
  return sendMessage("save-to-local-storage", items, source);
}

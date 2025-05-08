import { type Mutate, type StoreApi, createStore, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { type Browser, browser } from "../browser.ts";
import { defaultLocalStorageItems } from "../local-storage.ts";
import type { LocalStorageItems, LocalStorageItemsSavable } from "../types.ts";

type AreaName = "sync" | "local" | "managed" | "session";

type StorageStoreApi<
  T extends Record<string, unknown>,
  U extends Partial<T>,
> = Mutate<StoreApi<T>, [["zustand/subscribeWithSelector", never]]> & {
  attachPromise: Promise<void>;
  detach: () => void;
  use: { [K in keyof T]: () => T[K] };
  get(): T;
  set(partial: Partial<U> | ((state: T) => Partial<U>)): void;
};

function createStorageStore<
  T extends Record<string, unknown>,
  U extends Partial<T> = T,
>(areaName: AreaName, defaultState: T): StorageStoreApi<T, U> {
  const store = createStore(
    subscribeWithSelector(() => defaultState),
  ) as StorageStoreApi<T, U>;

  const area = browser.storage[areaName];

  store.attachPromise = area.get(defaultState).then((state) => {
    store.setState(state as T);
  });

  const listener = (
    changes: Browser.Storage.StorageAreaOnChangedChangesType,
  ) => {
    const state: Partial<T> = {};
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (!Object.hasOwn(defaultState, key) || newValue === undefined) {
        // Ignore key additions and deletions
        continue;
      }
      state[key as keyof T] = newValue as T[keyof T];
    }
    store.setState(state);
  };
  area.onChanged.addListener(listener);
  store.detach = () => {
    area.onChanged.removeListener(listener);
  };

  store.use = {} as { [K in keyof T]: () => T[K] };
  for (const key of Object.keys(defaultState)) {
    store.use[key as keyof T] = () =>
      useStore(store, (state) => state[key] as T[keyof T]);
  }

  store.get = store.getState;

  store.set = (partial) => {
    const state =
      typeof partial === "function" ? partial(store.getState()) : partial;
    void area.set(state);
  };

  return store;
}

export const storageStore = createStorageStore<
  LocalStorageItems,
  LocalStorageItemsSavable
>("local", defaultLocalStorageItems);

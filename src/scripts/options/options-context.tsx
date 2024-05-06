import React, { useContext, useEffect, useState } from "react";
import { type Browser, browser } from "../browser.ts";
import { loadAllFromLocalStorage } from "../local-storage.ts";
import type { LocalStorageItems } from "../types.ts";

export type OptionsQuery = {
  addSubscriptionName: string | null;
  addSubscriptionURL: string | null;
};

export type OptionsContextValue = {
  initialItems: LocalStorageItems;
  platformInfo: Browser.Runtime.PlatformInfo;
  query: OptionsQuery;
};

const OptionsContext = React.createContext<OptionsContextValue | null>(null);

export const OptionsContextProvider: React.FC<{ children: React.ReactNode }> = (
  props,
) => {
  const [value, setValue] = useState<OptionsContextValue | null>(null);
  useEffect(() => {
    void (async () => {
      const [initialItems, platformInfo] = await Promise.all([
        loadAllFromLocalStorage(),
        browser.runtime.getPlatformInfo(),
      ]);
      const searchParams = new URL(window.location.href).searchParams;
      const query = {
        addSubscriptionName: searchParams.get("addSubscriptionName"),
        addSubscriptionURL: searchParams.get("addSubscriptionURL"),
      };
      setValue({ initialItems, platformInfo, query });
    })();
  }, []);
  return (
    value && (
      <OptionsContext.Provider value={value}>
        {props.children}
      </OptionsContext.Provider>
    )
  );
};

export function useOptionsContext(): OptionsContextValue {
  const value = useContext(OptionsContext);
  if (!value) {
    throw new Error("useOptionsContext: no matching provider");
  }
  return value;
}

import { FunctionComponent, createContext, h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { apis } from '../apis';
import { loadAllFromLocalStorage } from '../local-storage';
import { LocalStorageItems } from '../types';

export type OptionsQuery = {
  addSubscriptionName: string | null;
  addSubscriptionURL: string | null;
};

export type OptionsContextValue = {
  initialItems: LocalStorageItems;
  platformInfo: apis.runtime.PlatformInfo;
  query: OptionsQuery;
};

const OptionsContext = createContext<OptionsContextValue | null>(null);

export const OptionsContextProvider: FunctionComponent = props => {
  const [value, setValue] = useState<OptionsContextValue | null>(null);
  useEffect(() => {
    void (async () => {
      const [initialItems, platformInfo] = await Promise.all([
        loadAllFromLocalStorage(),
        apis.runtime.getPlatformInfo(),
      ]);
      const searchParams = new URL(window.location.href).searchParams;
      const query = {
        addSubscriptionName: searchParams.get('addSubscriptionName'),
        addSubscriptionURL: searchParams.get('addSubscriptionURL'),
      };
      setValue({ initialItems, platformInfo, query });
    })();
  }, []);
  return value && <OptionsContext.Provider value={value}>{props.children}</OptionsContext.Provider>;
};

export function useOptionsContext(): OptionsContextValue {
  const value = useContext(OptionsContext);
  if (!value) {
    throw new Error('useOptionsContext: no matching provider');
  }
  return value;
}

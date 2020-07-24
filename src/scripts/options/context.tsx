import { FunctionComponent, createContext, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import * as LocalStorage from '../local-storage';
import { apis } from '../apis';

export type ContextValue = {
  initialItems: LocalStorage.Items;
  platformInfo: apis.runtime.PlatformInfo;
};

export const Context = createContext({} as Readonly<ContextValue>);

export const ContextProvider: FunctionComponent = props => {
  const [value, setValue] = useState<ContextValue | null>(null);
  useEffect(() => {
    void (async () => {
      const [initialItems, platformInfo] = await Promise.all([
        LocalStorage.loadAll(),
        apis.runtime.getPlatformInfo(),
      ]);
      setValue({ initialItems, platformInfo });
    })();
  }, []);
  return value && <Context.Provider value={value}>{props.children}</Context.Provider>;
};

import React from 'react';
import * as LocalStorage from '../local-storage';
import { apis } from '../apis';

export type ContextValue = {
  initialItems: LocalStorage.Items;
  platformInfo: apis.runtime.PlatformInfo;
};

export const Context = React.createContext({} as Readonly<ContextValue>);

export const ContextProvider: React.FC = props => {
  const [value, setValue] = React.useState<ContextValue | null>(null);
  React.useEffect(() => {
    (async () => {
      const [initialItems, platformInfo] = await Promise.all([
        LocalStorage.loadAll(),
        apis.runtime.getPlatformInfo(),
      ]);
      setValue({ initialItems, platformInfo });
    })();
  }, []);
  return value && <Context.Provider value={value}>{props.children}</Context.Provider>;
};

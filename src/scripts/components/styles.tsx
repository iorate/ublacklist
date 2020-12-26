import * as goober from 'goober';
import { FunctionComponent, createContext, h } from 'preact';
import { useContext } from 'preact/hooks';

type StylesContextValue = {
  css: typeof goober.css;
  glob: typeof goober.glob;
};

const StylesContext = createContext<StylesContextValue>({
  css: goober.css,
  glob: goober.glob,
});

export type StylesProviderProps = {
  target: HTMLElement | ShadowRoot;
};

export const StylesProvider: FunctionComponent<StylesProviderProps> = ({ children, target }) => {
  return (
    <StylesContext.Provider
      value={{
        css: goober.css.bind({ target }),
        glob: goober.css.bind({ g: 1, target }),
      }}
    >
      {children}
    </StylesContext.Provider>
  );
};

export function useCSS(): typeof goober.css {
  const { css } = useContext(StylesContext);
  return css;
}

export function useGlob(): typeof goober.glob {
  const { glob } = useContext(StylesContext);
  return glob;
}

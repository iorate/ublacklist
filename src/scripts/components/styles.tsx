import * as goober from 'goober';
import { FunctionComponent, createContext, h } from 'preact';
import { useContext } from 'preact/hooks';

goober.setup(h);

type StylesContextValue = {
  css: typeof goober.css;
  glob: typeof goober.glob;
  styled: typeof goober.styled;
};

const StylesContext = createContext<StylesContextValue>({
  css: goober.css,
  glob: goober.glob,
  styled: goober.styled,
});

export type StylesProviderProps = {
  target: HTMLElement | ShadowRoot;
};

export const StylesProvider: FunctionComponent<StylesProviderProps> = ({ children, target }) => {
  return (
    <StylesContext.Provider
      value={{
        css: goober.css.bind({ target } as unknown),
        glob: goober.glob.bind({ target }),
        styled: goober.styled.bind({ target } as unknown),
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

export function useStyled(): typeof goober.styled {
  const { styled } = useContext(StylesContext);
  return styled;
}

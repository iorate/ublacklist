import * as Goober from "goober";
import React, { useContext } from "react";

type StylesContextValue = {
  css: typeof Goober.css;
  glob: typeof Goober.glob;
};

const StylesContext = React.createContext<StylesContextValue>({
  css: Goober.css,
  glob: Goober.glob,
});

export type StylesProviderProps = {
  children?: React.ReactNode;
  target: HTMLElement | ShadowRoot;
};

export const StylesProvider: React.FC<StylesProviderProps> = ({
  children,
  target,
}) => {
  return (
    <StylesContext.Provider
      value={{
        css: Goober.css.bind({ target }),
        glob: Goober.css.bind({ g: 1, target }),
      }}
    >
      {children}
    </StylesContext.Provider>
  );
};

export function useCSS(): typeof Goober.css {
  const { css } = useContext(StylesContext);
  return css;
}

export function useGlob(): typeof Goober.glob {
  const { glob } = useContext(StylesContext);
  return glob;
}

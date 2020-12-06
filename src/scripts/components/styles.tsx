import * as goober from 'goober';
import { FunctionComponent, createContext, h } from 'preact';
import { useContext } from 'preact/hooks';

goober.setup(h);

const StylesContext = createContext<{ target?: HTMLElement | ShadowRoot }>({});

export type StylesContextProps = { target: HTMLElement | ShadowRoot };

export const StylesProvider: FunctionComponent<StylesContextProps> = ({ children, target }) => {
  return <StylesContext.Provider value={{ target }}>{children}</StylesContext.Provider>;
};

export function useCSS(): typeof goober.css {
  const { target } = useContext(StylesContext);
  return target ? goober.css.bind({ target } as unknown) : goober.css;
}

export function useGlob(): typeof goober.glob {
  const { target } = useContext(StylesContext);
  return target ? goober.glob.bind({ target }) : goober.glob;
}

export function useStyled(): typeof goober.styled {
  const { target } = useContext(StylesContext);
  return target ? goober.styled.bind({ target } as unknown) : goober.styled;
}

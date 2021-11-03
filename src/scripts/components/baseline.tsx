import { Fragment, FunctionComponent, h } from 'preact';
import { useLayoutEffect, useMemo } from 'preact/hooks';
import { useCSS, useGlob } from './styles';
import { useTheme } from './theme';

const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

export type BaseLineProps = { fontSize?: string };

export const Baseline: FunctionComponent<BaseLineProps> = ({ children, fontSize = '13px' }) => {
  const css = useCSS();
  const theme = useTheme();
  const bodyClass = useMemo(
    () =>
      css({
        background: theme.background,
        color: theme.text.primary,
        margin: 0,
        fontFamily,
        fontSize,
        lineHeight: 1.5,
      }),
    [css, theme, fontSize],
  );
  useLayoutEffect(() => {
    document.body.classList.add(bodyClass);
    return () => {
      document.body.classList.remove(bodyClass);
    };
  }, [bodyClass]);

  const glob = useGlob();
  useLayoutEffect(() => {
    glob({
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
    });
  }, [glob]);

  return <>{children}</>;
};

export type ScopedBaselineProps = { fontSize?: string };

export const ScopedBaseline: FunctionComponent<ScopedBaselineProps> = ({
  children,
  fontSize = '13px',
}) => {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        color: theme.text.primary,
        fontFamily,
        fontSize,
        lineHeight: 1.5,
        '& *, & *::before, & *::after': {
          boxSizing: 'border-box',
        },
      }),
    [css, theme, fontSize],
  );
  return <div class={class_}>{children}</div>;
};

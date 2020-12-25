import { Fragment, FunctionComponent, h } from 'preact';
import { useLayoutEffect, useMemo } from 'preact/hooks';
import { useCSS, useGlob } from './styles';
import { useTheme } from './theme';

export type BaseLineProps = { fontSize?: string };

export const Baseline: FunctionComponent<BaseLineProps> = ({ children, fontSize }) => {
  const css = useCSS();
  const theme = useTheme();
  const bodyClass = useMemo(
    () =>
      css({
        background: theme.background,
        color: theme.text.primary,
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: fontSize ?? '13px',
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

export const ScopedBaseline: FunctionComponent<ScopedBaselineProps> = ({ children, fontSize }) => {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        color: theme.text.primary,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: fontSize ?? '13px',
        lineHeight: 1.5,
        '& *, & *::before, & *::after': {
          boxSizing: 'border-box',
        },
      }),
    [css, theme, fontSize],
  );
  return <div class={class_}>{children}</div>;
};

import React, { useLayoutEffect, useMemo } from 'react';
import { useCSS, useGlob } from './styles';
import { useTheme } from './theme';

const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

export type BaseLineProps = { children?: React.ReactNode; fontSize?: string };

export const Baseline: React.VFC<BaseLineProps> = ({ children, fontSize = '13px' }) => {
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

export type ScopedBaselineProps = { children?: React.ReactNode; fontSize?: string };

export const ScopedBaseline: React.VFC<ScopedBaselineProps> = ({ children, fontSize = '13px' }) => {
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
  return <div className={class_}>{children}</div>;
};

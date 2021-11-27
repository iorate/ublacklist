import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type DetailsProps = JSX.IntrinsicElements['details'];

export const Details = React.forwardRef<HTMLDetailsElement, DetailsProps>(function Details(
  props,
  ref,
) {
  return <details {...props} ref={ref} />;
});

export type DetailsSummaryProps = JSX.IntrinsicElements['summary'];

export const DetailsSummary = React.forwardRef<HTMLElement, DetailsSummaryProps>(
  function DetailsSummary(props, ref) {
    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(
      () =>
        css({
          cursor: 'pointer',
          outline: 'none',
          '&:focus': {
            boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
          },
          '&:focus:not(:focus-visible)': {
            boxShadow: 'none',
          },
          '&:focus:not(:-moz-focusring)': {
            boxShadow: 'none',
          },
        }),
      [css, theme],
    );
    return <summary {...applyClass(props, class_)} ref={ref} />;
  },
);

export type DetailsBodyProps = JSX.IntrinsicElements['div'];

export const DetailsBody = React.forwardRef<HTMLDivElement, DetailsBodyProps>(function DetailsBody(
  props,
  ref,
) {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        marginTop: '1em',
      }),
    [css],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

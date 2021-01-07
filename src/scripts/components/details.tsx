import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type DetailsProps = JSX.IntrinsicElements['details'];

export const Details = forwardRef((props: DetailsProps, ref: Ref<HTMLDetailsElement>) => {
  return <details {...props} ref={ref} />;
});

export type DetailsSummaryProps = JSX.IntrinsicElements['summary'];

export const DetailsSummary = forwardRef((props: DetailsSummaryProps, ref: Ref<HTMLElement>) => {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        cursor: 'pointer',
        outline: 'none',
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        '&:-moz-focusring': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
      }),
    [css, theme],
  );
  return <summary {...applyClass(props, class_)} ref={ref} />;
});

export type DetailsBodyProps = JSX.IntrinsicElements['div'];

export const DetailsBody = forwardRef((props: DetailsBodyProps, ref: Ref<HTMLDivElement>) => {
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

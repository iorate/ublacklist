import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type RowProps = { multiline?: boolean; right?: boolean } & JSX.IntrinsicElements['div'];

export const Row = React.forwardRef<HTMLDivElement, RowProps>(function Row(
  { multiline = false, right = false, ...props },
  ref,
) {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        alignItems: 'center',
        display: 'flex',
        flexWrap: multiline ? 'wrap' : 'nowrap',
        justifyContent: right ? 'flex-end' : 'flex-start',
        '&:not(:first-child)': {
          marginTop: '1em',
        },
      }),
    [css, multiline, right],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

export type RowItemProps = { expanded?: boolean } & JSX.IntrinsicElements['div'];

export const RowItem = React.forwardRef<HTMLDivElement, RowItemProps>(function RowItem(
  { expanded = false, ...props },
  ref,
) {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        flexGrow: expanded ? 1 : 0,
        flexShrink: expanded ? 1 : 0,
        minWidth: 0,
        '&:not(:first-child)': {
          marginLeft: '0.625em',
        },
      }),
    [css, expanded],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

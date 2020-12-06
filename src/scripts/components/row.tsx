import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type RowProps = { multiline?: boolean; right?: boolean } & JSX.IntrinsicElements['div'];

export const Row = forwardRef(
  ({ multiline, right, ...props }: RowProps, ref: Ref<HTMLDivElement>) => {
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
  },
);

export type RowItemProps = { expanded?: boolean } & JSX.IntrinsicElements['div'];

export const RowItem = forwardRef(
  ({ expanded, ...props }: RowItemProps, ref: Ref<HTMLDivElement>) => {
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
  },
);

import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type IndentProps = JSX.IntrinsicElements['div'];

export const Indent = forwardRef((props: IndentProps, ref: Ref<HTMLDivElement>) => {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        width: '2.25em',
      }),
    [css],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type IndentProps = JSX.IntrinsicElements['div'];

export const Indent = React.forwardRef<HTMLDivElement, IndentProps>(function Indent(props, ref) {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        width: '2.375em',
      }),
    [css],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

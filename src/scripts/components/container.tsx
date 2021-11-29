import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type ContainerProps = { width?: string } & JSX.IntrinsicElements['div'];

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { width = '640px', ...props },
  ref,
) {
  const css = useCSS();
  const wrapperClass = useMemo(
    () =>
      css({
        bottom: 0,
        left: 0,
        overflow: 'auto',
        position: 'fixed',
        right: 0,
        top: 0,
      }),
    [css],
  );
  const containerClass = useMemo(
    () =>
      css({
        margin: '0 auto',
        maxWidth: '100%',
        padding: '2em 0',
        width,
      }),
    [css, width],
  );
  return (
    <div className={wrapperClass}>
      <div {...applyClass(props, containerClass)} ref={ref} />
    </div>
  );
});

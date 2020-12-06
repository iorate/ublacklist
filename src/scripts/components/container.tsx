import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type ContainerProps = { width?: string } & JSX.IntrinsicElements['div'];

export const Container = forwardRef(
  ({ width, ...props }: ContainerProps, ref: Ref<HTMLDivElement>) => {
    const css = useCSS();
    const wrapperClass = useMemo(
      () =>
        css({
          height: '100vh',
          overflowY: 'auto',
        }),
      [css],
    );
    const containerClass = useMemo(
      () =>
        css({
          margin: '0 auto',
          maxWidth: '100%',
          padding: '2em 0',
          width: width ?? '640px',
        }),
      [css, width],
    );
    return (
      <div class={wrapperClass}>
        <div {...applyClass(props, containerClass)} ref={ref} />
      </div>
    );
  },
);

import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type IconProps = {
  color?: string;
  iconSize?: string;
  url: string;
} & JSX.IntrinsicElements['span'];

export const Icon = forwardRef(
  ({ color = 'black', iconSize = '24px', url, ...props }: IconProps, ref: Ref<HTMLSpanElement>) => {
    const css = useCSS();
    const class_ = useMemo(
      () =>
        css({
          backgroundColor: color,
          display: 'block',
          height: iconSize,
          mask: `url("${url}") center / ${iconSize} no-repeat`,
          WebkitMask: `url("${url}") center / ${iconSize} no-repeat`,
          width: iconSize,
        }),
      [css, color, iconSize, url],
    );
    return <span {...applyClass(props, class_)} ref={ref} />;
  },
);

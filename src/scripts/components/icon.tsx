import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';

export type IconProps = {
  iconSize?: string;
  url: string;
} & JSX.IntrinsicElements['span'];

export const Icon = forwardRef(
  ({ iconSize = '24px', url, ...props }: IconProps, ref: Ref<HTMLSpanElement>) => {
    const css = useCSS();
    const class_ = useMemo(
      () =>
        css({
          background: `url("${url}") center / ${iconSize} no-repeat`,
          display: 'block',
          height: iconSize,
          width: iconSize,
        }),
      [css, iconSize, url],
    );
    return <span {...applyClass(props, class_)} ref={ref} />;
  },
);

export type TemplateIconProps = {
  color?: string;
  iconSize?: string;
  url: string;
} & JSX.IntrinsicElements['span'];

export const TemplateIcon = forwardRef(
  (
    { color = 'black', iconSize = '24px', url, ...props }: TemplateIconProps,
    ref: Ref<HTMLSpanElement>,
  ) => {
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

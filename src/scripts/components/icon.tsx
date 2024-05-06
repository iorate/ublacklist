import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type IconProps = JSX.IntrinsicElements["span"] & {
  iconSize?: string;
  url: string;
};

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { iconSize = "24px", url, ...props },
  ref,
) {
  const className = useClassName(
    () => ({
      background: `url("${url}") center / ${iconSize} no-repeat`,
      display: "block",
      height: iconSize,
      width: iconSize,
    }),
    [iconSize, url],
  );
  return <span {...applyClassName(props, className)} ref={ref} />;
});

export type TemplateIconProps = JSX.IntrinsicElements["span"] & {
  color?: string;
  iconSize?: string;
  url: string;
};

export const TemplateIcon = React.forwardRef<
  HTMLSpanElement,
  TemplateIconProps
>(function TemplateIcon(
  { color = "black", iconSize = "24px", url, ...props },
  ref,
) {
  const className = useClassName(
    () => ({
      backgroundColor: color,
      display: "block",
      height: iconSize,
      mask: `url("${url}") center / ${iconSize} no-repeat`,
      WebkitMask: `url("${url}") center / ${iconSize} no-repeat`,
      width: iconSize,
    }),
    [color, iconSize, url],
  );
  return <span {...applyClassName(props, className)} ref={ref} />;
});

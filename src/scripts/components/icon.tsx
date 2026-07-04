import type React from "react";
import { applyClassName } from "./helpers.tsx";
import styles from "./icon.module.css";

export type IconProps = React.JSX.IntrinsicElements["span"] & {
  iconSize?: string;
  url: string;
};

export function Icon({ iconSize = "24px", url, style, ...props }: IconProps) {
  return (
    <span
      {...applyClassName(props, styles.icon ?? "")}
      style={{
        background: `url("${url}") center / ${iconSize} no-repeat`,
        height: iconSize,
        width: iconSize,
        ...style,
      }}
    />
  );
}

export type TemplateIconProps = React.JSX.IntrinsicElements["span"] & {
  color?: string;
  iconSize?: string;
  url: string;
};

export function TemplateIcon({
  color = "black",
  iconSize = "24px",
  url,
  style,
  ...props
}: TemplateIconProps) {
  return (
    <span
      {...applyClassName(props, styles.icon ?? "")}
      style={{
        backgroundColor: color,
        height: iconSize,
        mask: `url("${url}") center / ${iconSize} no-repeat`,
        WebkitMask: `url("${url}") center / ${iconSize} no-repeat`,
        width: iconSize,
        ...style,
      }}
    />
  );
}

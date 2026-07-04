import clsx from "clsx";
import type React from "react";
import styles from "./svg-icon.module.css";

export type SvgIconProps = React.JSX.IntrinsicElements["span"] & {
  color?: string | undefined;
  svg: string;
};

export function SvgIcon({
  className,
  color,
  style,
  svg,
  ...props
}: SvgIconProps) {
  return (
    <span
      aria-hidden={true}
      {...props}
      className={clsx(styles.icon, className)}
      ref={(element) => {
        if (element) {
          element.innerHTML = svg;
        }
      }}
      style={color != null ? { color, ...style } : style}
    />
  );
}

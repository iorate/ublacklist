import clsx from "clsx";
import type React from "react";
import { useLayoutEffect, useRef } from "react";
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
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = svg;
    }
  }, [svg]);
  return (
    <span
      aria-hidden={true}
      {...props}
      className={clsx(styles.icon, className)}
      ref={ref}
      style={color != null ? { color, ...style } : style}
    />
  );
}

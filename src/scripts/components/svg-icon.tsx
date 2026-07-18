import clsx from "clsx";
import { useLayoutEffect, useRef } from "react";
import styles from "./svg-icon.module.css";

export type SvgIconProps = {
  color?: string | undefined;
  size?: "medium" | "large";
  svg: string;
};

export function SvgIcon({ color, size = "medium", svg }: SvgIconProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Do not recreate the SVG unless `svg` changes; see #940.
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = svg;
    }
  }, [svg]);
  return (
    <span
      aria-hidden={true}
      className={clsx(styles.icon, size === "large" && styles.large)}
      ref={ref}
      style={color != null ? { color } : undefined}
    />
  );
}

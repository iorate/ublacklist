import clsx from "clsx";
import type React from "react";
import styles from "./link.module.css";

export type LinkProps = React.ComponentProps<"a">;

export function Link({ className, ...props }: LinkProps) {
  return (
    <a
      {...props}
      className={clsx(styles.link, className)}
      rel="noopener noreferrer"
      target="_blank"
    />
  );
}

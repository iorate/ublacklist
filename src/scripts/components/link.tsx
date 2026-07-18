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

export function expandLinks(text: string): React.ReactNode {
  const children: React.ReactNode[] = [];
  const split = text.split(/\[([^\]]*)]\(([^)]*)\)/g);
  for (let i = 0; i < split.length; ++i) {
    if (i % 3 === 0) {
      children.push(split[i]);
    } else if (i % 3 === 1) {
      children.push(
        <Link href={split[i + 1]} key={i}>
          {split[i]}
        </Link>,
      );
      ++i;
    }
  }
  return <>{children}</>;
}

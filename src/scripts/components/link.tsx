import clsx from "clsx";
import type React from "react";
import styles from "./link.module.css";

export type LinkProps = React.JSX.IntrinsicElements["a"] & {
  disabled?: boolean;
};

export function Link({ className, disabled = false, ...props }: LinkProps) {
  return (
    <a
      {...props}
      className={clsx(styles.link, className)}
      {...(disabled ? {} : { href: props.href })}
      rel="noopener noreferrer"
      target="_blank"
    />
  );
}

export function expandLinks(text: string, disabled = false): React.ReactNode {
  const children: React.ReactNode[] = [];
  const split = text.split(/\[([^\]]*)]\(([^)]*)\)/g);
  for (let i = 0; i < split.length; ++i) {
    if (i % 3 === 0) {
      children.push(split[i]);
    } else if (i % 3 === 1) {
      children.push(
        <Link disabled={disabled} href={split[i + 1]} key={i}>
          {split[i]}
        </Link>,
      );
      ++i;
    }
  }
  return <>{children}</>;
}

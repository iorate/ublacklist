import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type LinkProps = JSX.IntrinsicElements["a"] & { disabled?: boolean };

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ disabled = false, ...props }, ref) {
    const className = useClassName(
      (theme) => ({
        color: theme.link.text,
        outline: "none",
        textDecoration: "none",
        "&:focus": {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        "&:focus:not(:focus-visible)": {
          boxShadow: "none",
        },
        "&:focus:not(:-moz-focusring)": {
          boxShadow: "none",
        },
      }),
      [],
    );
    return (
      <a
        {...applyClassName(props, className)}
        {...(disabled ? {} : { href: props.href })}
        ref={ref}
        rel="noopener noreferrer"
        target="_blank"
      />
    );
  },
);

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

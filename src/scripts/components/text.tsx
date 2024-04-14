import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type TextProps = JSX.IntrinsicElements["span"] & { primary?: boolean };

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(function Text(
  { primary = false, ...props },
  ref,
) {
  const className = useClassName(
    (theme) => ({
      color: primary ? theme.text.primary : theme.text.secondary,
    }),
    [primary],
  );
  return <span {...applyClassName(props, className)} ref={ref} />;
});

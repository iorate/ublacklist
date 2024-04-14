import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type IndentProps = JSX.IntrinsicElements["div"] & {
  depth?: number;
};

export const Indent = React.forwardRef<HTMLDivElement, IndentProps>(
  function Indent({ depth = 1, ...props }, ref) {
    const className = useClassName(
      () => ({
        width: `${2.375 * depth}em`,
      }),
      [depth],
    );
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

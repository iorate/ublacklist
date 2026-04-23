import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type BadgeProps = React.JSX.IntrinsicElements["span"];

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(props, ref) {
    const className = useClassName(
      (theme) => ({
        border: `1px solid ${theme.select.border}`,
        borderRadius: "4px",
        color: theme.text.secondary,
        fontSize: "12px",
        padding: "0 0.4em",
        verticalAlign: "middle",
        whiteSpace: "nowrap",
      }),
      [],
    );
    return <span {...applyClassName(props, className)} ref={ref} />;
  },
);

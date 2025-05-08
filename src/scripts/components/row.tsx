import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type RowProps = React.JSX.IntrinsicElements["div"] & {
  multiline?: boolean;
  right?: boolean;
  spacing?: 0 | string;
};

export const Row = React.forwardRef<HTMLDivElement, RowProps>(function Row(
  { multiline = false, right = false, spacing = "1em", ...props },
  ref,
) {
  const className = useClassName(
    () => ({
      alignItems: "center",
      display: "flex",
      flexWrap: multiline ? "wrap" : "nowrap",
      justifyContent: right ? "flex-end" : "flex-start",
      "&:not(:first-child)": {
        marginTop: spacing,
      },
    }),
    [multiline, right, spacing],
  );
  return <div {...applyClassName(props, className)} ref={ref} />;
});

export type RowItemProps = React.JSX.IntrinsicElements["div"] & {
  expanded?: boolean;
  spacing?: 0 | string;
};

export const RowItem = React.forwardRef<HTMLDivElement, RowItemProps>(
  function RowItem({ expanded = false, spacing = "0.625em", ...props }, ref) {
    const className = useClassName(
      () => ({
        flexGrow: expanded ? 1 : 0,
        flexShrink: expanded ? 1 : 0,
        minWidth: 0,
        "&:not(:first-child)": {
          marginLeft: spacing,
        },
      }),
      [expanded],
    );
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

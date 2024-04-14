import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type RowProps = JSX.IntrinsicElements["div"] & {
  multiline?: boolean;
  right?: boolean;
};

export const Row = React.forwardRef<HTMLDivElement, RowProps>(function Row(
  { multiline = false, right = false, ...props },
  ref,
) {
  const className = useClassName(
    () => ({
      alignItems: "center",
      display: "flex",
      flexWrap: multiline ? "wrap" : "nowrap",
      justifyContent: right ? "flex-end" : "flex-start",
      "&:not(:first-child)": {
        marginTop: "1em",
      },
    }),
    [multiline, right],
  );
  return <div {...applyClassName(props, className)} ref={ref} />;
});

export type RowItemProps = JSX.IntrinsicElements["div"] & {
  expanded?: boolean;
};

export const RowItem = React.forwardRef<HTMLDivElement, RowItemProps>(
  function RowItem({ expanded = false, ...props }, ref) {
    const className = useClassName(
      () => ({
        flexGrow: expanded ? 1 : 0,
        flexShrink: expanded ? 1 : 0,
        minWidth: 0,
        "&:not(:first-child)": {
          marginLeft: "0.625em",
        },
      }),
      [expanded],
    );
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

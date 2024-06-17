import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type TableProps = JSX.IntrinsicElements["table"];

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  function Table(props, ref) {
    const className = useClassName(
      () => ({
        borderSpacing: 0,
        tableLayout: "fixed",
        width: "100%",
      }),
      [],
    );
    return <table {...applyClassName(props, className)} ref={ref} />;
  },
);

export type TableHeaderProps = JSX.IntrinsicElements["thead"];

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(function TableHeader(props, ref) {
  return <thead {...props} ref={ref} />;
});

export type TableHeaderRowProps = JSX.IntrinsicElements["tr"];

export const TableHeaderRow = React.forwardRef<
  HTMLTableRowElement,
  TableHeaderRowProps
>(function TableHeaderRow(props, ref) {
  return <tr {...props} ref={ref} />;
});

export type TableHeaderCellProps = JSX.IntrinsicElements["th"] & {
  width?: string;
};

export const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps
>(function TableHeaderCell({ width = "auto", ...props }, ref) {
  const className = useClassName(
    (theme) => ({
      color: theme.text.secondary,
      fontWeight: "normal",
      overflowWrap: "break-word",
      padding: "0.75em 0",
      textAlign: "start",
      verticalAlign: "middle",
      width,
      "&:not(:first-child)": {
        paddingLeft: "0.75em",
      },
    }),
    [width],
  );
  return <th {...applyClassName(props, className)} ref={ref} />;
});

export type TableBodyProps = JSX.IntrinsicElements["tbody"];

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(function TableBody(props, ref) {
  return <tbody {...props} ref={ref} />;
});

export type TableRowProps = JSX.IntrinsicElements["tr"];

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow(props, ref) {
    return <tr {...props} ref={ref} />;
  },
);

export type TableCellProps = JSX.IntrinsicElements["td"];

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell(props, ref) {
    const className = useClassName(
      (theme) => ({
        borderTop: `solid 1px ${theme.separator}`,
        overflowWrap: "break-word",
        padding: "0.75em 0",
        verticalAlign: "middle",
        "&:not(:first-child)": {
          paddingLeft: "0.75em",
        },
      }),
      [],
    );
    return <td {...applyClassName(props, className)} ref={ref} />;
  },
);

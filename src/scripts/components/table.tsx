import React from 'react';
import { applyClassName } from './helpers';
import { useClassName } from './utilities';

export type TableProps = JSX.IntrinsicElements['table'];

export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(props, ref) {
  const className = useClassName({
    borderSpacing: 0,
    tableLayout: 'fixed',
    width: '100%',
  });
  return <table {...applyClassName(props, className)} ref={ref} />;
});

export type TableHeaderProps = JSX.IntrinsicElements['thead'];

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader(props, ref) {
    return <thead {...props} ref={ref} />;
  },
);

export type TableHeaderRowProps = JSX.IntrinsicElements['tr'];

export const TableHeaderRow = React.forwardRef<HTMLTableRowElement, TableHeaderRowProps>(
  function TableHeaderRow(props, ref) {
    return <tr {...props} ref={ref} />;
  },
);

export type TableHeaderCellProps = JSX.IntrinsicElements['th'] & {
  breakAll?: boolean;
  width?: string;
};

export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ breakAll, width = 'auto', ...props }, ref) {
    const className = useClassName(
      theme => ({
        color: theme.text.secondary,
        fontWeight: 'normal',
        padding: '0.75em 0',
        textAlign: 'start',
        verticalAlign: 'middle',
        width,
        wordBreak: breakAll ? 'break-all' : 'normal',
        '&:not(:first-child)': {
          paddingLeft: '0.75em',
        },
      }),
      [breakAll, width],
    );
    return <th {...applyClassName(props, className)} ref={ref} />;
  },
);

export type TableBodyProps = JSX.IntrinsicElements['tbody'];

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody(props, ref) {
    return <tbody {...props} ref={ref} />;
  },
);

export type TableRowProps = JSX.IntrinsicElements['tr'];

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  props,
  ref,
) {
  return <tr {...props} ref={ref} />;
});

export type TableCellProps = { breakAll?: boolean } & JSX.IntrinsicElements['td'];

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { breakAll, ...props },
  ref,
) {
  const className = useClassName(
    theme => ({
      borderTop: `solid 1px ${theme.separator}`,
      padding: '0.75em 0',
      verticalAlign: 'middle',
      wordBreak: breakAll ? 'break-all' : 'normal',
      '&:not(:first-child)': {
        paddingLeft: '0.75em',
      },
    }),
    [breakAll],
  );
  return <td {...applyClassName(props, className)} ref={ref} />;
});

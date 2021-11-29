import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type TableProps = JSX.IntrinsicElements['table'];

export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(props, ref) {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        borderSpacing: 0,
        tableLayout: 'fixed',
        width: '100%',
      }),
    [css],
  );
  return <table {...applyClass(props, class_)} ref={ref} />;
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

export type TableHeaderCellProps = {
  breakAll?: boolean;
  width?: string;
} & JSX.IntrinsicElements['th'];

export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ breakAll, width = 'auto', ...props }, ref) {
    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(
      () =>
        css({
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
      [css, theme, breakAll, width],
    );
    return <th {...applyClass(props, class_)} ref={ref} />;
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
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        borderTop: `solid 1px ${theme.separator}`,
        padding: '0.75em 0',
        verticalAlign: 'middle',
        wordBreak: breakAll ? 'break-all' : 'normal',
        '&:not(:first-child)': {
          paddingLeft: '0.75em',
        },
      }),
    [css, theme, breakAll],
  );
  return <td {...applyClass(props, class_)} ref={ref} />;
});

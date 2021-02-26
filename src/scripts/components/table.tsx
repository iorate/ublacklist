import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type TableProps = JSX.IntrinsicElements['table'];

export const Table = forwardRef((props: TableProps, ref: Ref<HTMLTableElement>) => {
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

export const TableHeader = forwardRef(
  (props: TableHeaderProps, ref: Ref<HTMLTableSectionElement>) => {
    return <thead {...props} ref={ref} />;
  },
);

export type TableHeaderRowProps = JSX.IntrinsicElements['tr'];

export const TableHeaderRow = forwardRef(
  (props: TableHeaderRowProps, ref: Ref<HTMLTableRowElement>) => {
    return <tr {...props} ref={ref} />;
  },
);

export type TableHeaderCellProps = {
  breakAll?: boolean;
  width?: string;
} & JSX.IntrinsicElements['th'];

export const TableHeaderCell = forwardRef(
  (
    { breakAll, width = 'auto', ...props }: TableHeaderCellProps,
    ref: Ref<HTMLTableHeaderCellElement>,
  ) => {
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

export const TableBody = forwardRef((props: TableBodyProps, ref: Ref<HTMLTableSectionElement>) => {
  return <tbody {...props} ref={ref} />;
});

export type TableBodyRowProps = JSX.IntrinsicElements['tr'];

export const TableBodyRow = forwardRef(
  (props: TableBodyRowProps, ref: Ref<HTMLTableRowElement>) => {
    return <tr {...props} ref={ref} />;
  },
);

export type TableBodyCellProps = { breakAll?: boolean } & JSX.IntrinsicElements['td'];

export const TableBodyCell = forwardRef(
  ({ breakAll, ...props }: TableBodyCellProps, ref: Ref<HTMLTableDataCellElement>) => {
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
  },
);

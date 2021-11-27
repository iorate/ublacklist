import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type ListProps = JSX.IntrinsicElements['ul'];

export const List = React.forwardRef<HTMLUListElement, ListProps>(function List(props, ref) {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        listStyleType: 'none',
        margin: 0,
        padding: 0,
      }),
    [css],
  );
  return <ul {...applyClass(props, class_)} ref={ref} />;
});

export type ListItemProps = JSX.IntrinsicElements['li'];

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  props,
  ref,
) {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        padding: '0.75em 0',
        '&:not(:first-child)': {
          borderTop: `solid 1px ${theme.separator}`,
        },
      }),
    [css, theme],
  );
  return <li {...applyClass(props, class_)} ref={ref} />;
});

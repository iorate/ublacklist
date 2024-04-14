import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type ListProps = JSX.IntrinsicElements["ul"];

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  function List(props, ref) {
    const className = useClassName(
      () => ({
        listStyleType: "none",
        margin: 0,
        padding: 0,
      }),
      [],
    );
    return <ul {...applyClassName(props, className)} ref={ref} />;
  },
);

export type ListItemProps = JSX.IntrinsicElements["li"];

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem(props, ref) {
    const className = useClassName(
      (theme) => ({
        padding: "0.75em 0",
        "&:not(:first-child)": {
          borderTop: `solid 1px ${theme.separator}`,
        },
      }),
      [],
    );
    return <li {...applyClassName(props, className)} ref={ref} />;
  },
);

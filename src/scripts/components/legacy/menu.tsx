import React from "react";
import { MENU_ITEM_CLASS } from "../constants.ts";
import { applyClassName } from "../helpers.tsx";
import { useClassName } from "../utilities.ts";

export type MenuItemProps = React.JSX.IntrinsicElements["button"];

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const className = useClassName(
      (theme) => ({
        background: "transparent",
        border: "none",
        color: theme.text.primary,
        cursor: "pointer",
        display: "block",
        font: "inherit",
        height: "2.5em",
        padding: "0 2em",
        textAlign: "start",
        width: "100%",
        "&:disabled": {
          cursor: "default",
          opacity: 0.65,
        },
        "&:focus": {
          background: theme.menu.itemBackgroundFocused,
          outline: "none",
        },
        "&:hover:not(:disabled):not(:focus)": {
          background: theme.menu.itemBackgroundHovered,
        },
      }),
      [],
    );
    return (
      <button
        {...applyClassName(props, `${MENU_ITEM_CLASS} ${className}`)}
        ref={ref}
        role="menuitem"
      />
    );
  },
);

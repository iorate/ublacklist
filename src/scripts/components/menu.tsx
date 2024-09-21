import dotsVertical from "@mdi/svg/svg/dots-vertical.svg";
import React, { useLayoutEffect, useRef, useState } from "react";
import { svgToDataURL } from "../utilities.ts";
import { MENU_ITEM_CLASS, MENU_Z_INDEX } from "./constants.ts";
import { applyClassName, useInnerRef } from "./helpers.tsx";
import { IconButton } from "./icon-button.tsx";
import { useClassName } from "./utilities.ts";

function moveFocus(
  body: HTMLDivElement,
  key: "ArrowUp" | "ArrowDown" | "Home" | "End",
) {
  const items = [
    ...body.querySelectorAll<HTMLElement>(`.${MENU_ITEM_CLASS}:not(:disabled)`),
  ] as const;
  if (!items.length) {
    return;
  }
  const currentIndex = (items as readonly (Element | null)[]).indexOf(
    document.activeElement,
  );
  let nextIndex: number;
  if (key === "ArrowUp") {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
  } else if (key === "ArrowDown") {
    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
  } else if (key === "Home") {
    nextIndex = 0;
  } else {
    nextIndex = items.length - 1;
  }
  const nextItem = items[nextIndex];
  nextItem.focus();
}

export type MenuProps = JSX.IntrinsicElements["button"] & {
  children?: React.ReactNode;
  disabled?: boolean;
};

export const Menu = React.forwardRef<HTMLButtonElement, MenuProps>(
  function Menu({ children, disabled = false, ...props }, ref) {
    const [open, setOpen] = useState(false);
    const buttonRef = useInnerRef(ref);
    const bodyRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (open) {
        bodyRef.current?.focus();
      }
    }, [open]);

    const menuClassName = useClassName(
      () => ({
        outline: "none",
        position: "relative",
      }),
      [],
    );
    const bodyClassName = useClassName(
      (theme) => ({
        background: theme.menu.itemListBackground,
        boxShadow:
          "rgba(0, 0, 0, 0.3) 0px 1px 2px 0px, rgba(0, 0, 0, 0.15) 0px 3px 6px 2px",
        display: open ? "block" : "none",
        minWidth: "10em",
        outline: "none",
        padding: "0.75em 0",
        position: "absolute",
        top: "100%",
        right: 0,
        zIndex: MENU_Z_INDEX,
      }),
      [open],
    );

    return (
      <div
        className={menuClassName}
        tabIndex={-1 /* Capture focus when the button is clicked in Safari */}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Element | null)) {
            setOpen(false);
          }
        }}
      >
        <IconButton
          {...props}
          aria-expanded={open}
          aria-haspopup="menu"
          disabled={disabled}
          iconURL={svgToDataURL(dotsVertical)}
          ref={buttonRef}
          onClick={() => setOpen(!open)}
        />
        <div
          className={bodyClassName}
          ref={bodyRef}
          // biome-ignore lint/a11y/useSemanticElements: to be replaced in the future
          role="menu"
          tabIndex={-1}
          onClick={(e) => {
            if (
              e.target instanceof HTMLElement &&
              e.target.matches(`.${MENU_ITEM_CLASS}`)
            ) {
              setOpen(false);
              buttonRef.current?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              buttonRef.current?.focus();
            } else if (
              e.key === "ArrowUp" ||
              e.key === "ArrowDown" ||
              e.key === "Home" ||
              e.key === "End"
            ) {
              e.preventDefault();
              moveFocus(e.currentTarget, e.key);
            }
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);

export type MenuItemProps = JSX.IntrinsicElements["button"];

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

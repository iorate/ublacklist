import menuDown from "@mdi/svg/svg/menu-down.svg";
import type * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { svgToDataURL } from "../utilities.ts";
import { MENU_ITEM_CLASS, MENU_Z_INDEX } from "./constants.ts";
import { applyClassName } from "./helpers.tsx";
import { TemplateIcon } from "./icon.tsx";
import { useClassName } from "./utilities.ts";

// Get the deepest active element across shadow root boundaries.
// `document.activeElement` stops at shadow host; this walks into shadow roots
// so we can correctly identify the focused menu item inside a shadow tree.
function getDeepActiveElement(): Element | null {
  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

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
    getDeepActiveElement(),
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
  // biome-ignore lint/style/noNonNullAssertion: `nextIndex` is always within bounds.
  const nextItem = items[nextIndex]!;
  nextItem.focus();
}

// The main button receives any intrinsic `<button>` attribute (className,
// disabled, onClick, data-testid, ...) via rest props, mirroring `Button`. Only
// the menu-specific and layout props below are handled explicitly.
export type SplitButtonProps = React.JSX.IntrinsicElements["button"] & {
  menu: React.ReactNode;
  menuAriaLabel: string;
  menuClassName?: string | undefined;
  menuDisabled?: boolean;
  placement?: "top" | "bottom";
  primary?: boolean;
};

export const SplitButton: React.FC<SplitButtonProps> = ({
  menu,
  menuAriaLabel,
  menuClassName,
  menuDisabled = false,
  placement = "bottom",
  primary = false,
  ...buttonProps
}) => {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open) {
      bodyRef.current?.focus();
    }
  }, [open]);

  const wrapperClassName = useClassName(
    () => ({
      display: "inline-flex",
      position: "relative",
    }),
    [],
  );

  const mainClassName = useClassName(
    (theme) => {
      const buttonTheme = primary
        ? theme.button.primary
        : theme.button.secondary;
      return {
        background: buttonTheme.background,
        border: primary ? "none" : `solid 1px ${theme.button.secondary.border}`,
        borderRadius: "4px 0 0 4px",
        color: buttonTheme.text,
        cursor: "pointer",
        font: "inherit",
        height: "2.5em",
        outline: "none",
        padding: primary ? "0.5em 1em" : "calc(0.5em - 1px) 1em",
        position: "relative",
        "&:active": {
          background: buttonTheme.backgroundActive,
        },
        "&:disabled": {
          background: buttonTheme.backgroundDisabled,
          color: buttonTheme.textDisabled,
          cursor: "default",
        },
        "&:focus": {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
          zIndex: 1,
        },
        "&:focus:not(:focus-visible)": {
          boxShadow: "none",
        },
        "&:focus:not(:-moz-focusring)": {
          boxShadow: "none",
        },
        "&:hover:not(:active):not(:disabled)": {
          background: buttonTheme.backgroundHovered,
        },
      };
    },
    [primary],
  );

  const arrowClassName = useClassName(
    (theme) => {
      const buttonTheme = primary
        ? theme.button.primary
        : theme.button.secondary;
      const dividerColor = primary
        ? "rgba(255, 255, 255, 0.3)"
        : theme.button.secondary.border;
      return {
        alignItems: "center",
        background: buttonTheme.background,
        border: primary ? "none" : `solid 1px ${theme.button.secondary.border}`,
        borderLeft: `1px solid ${dividerColor}`,
        borderRadius: "0 4px 4px 0",
        color: buttonTheme.text,
        cursor: "pointer",
        display: "inline-flex",
        font: "inherit",
        height: "2.5em",
        justifyContent: "center",
        outline: "none",
        padding: 0,
        position: "relative",
        width: "2.5em",
        "&:active": {
          background: buttonTheme.backgroundActive,
        },
        "&:disabled": {
          background: buttonTheme.backgroundDisabled,
          color: buttonTheme.textDisabled,
          cursor: "default",
        },
        "&:focus": {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
          zIndex: 1,
        },
        "&:focus:not(:focus-visible)": {
          boxShadow: "none",
        },
        "&:focus:not(:-moz-focusring)": {
          boxShadow: "none",
        },
        "&:hover:not(:active):not(:disabled)": {
          background: buttonTheme.backgroundHovered,
        },
      };
    },
    [primary],
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
      right: 0,
      zIndex: MENU_Z_INDEX,
      ...(placement === "top"
        ? { bottom: "100%", marginBottom: "0.25em" }
        : { top: "100%", marginTop: "0.25em" }),
    }),
    [open, placement],
  );

  return (
    <div
      className={wrapperClassName}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Element | null)) {
          setOpen(false);
        }
      }}
    >
      <button {...applyClassName(buttonProps, mainClassName)} type="button" />
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={menuAriaLabel}
        className={
          menuClassName ? `${arrowClassName} ${menuClassName}` : arrowClassName
        }
        disabled={menuDisabled}
        onClick={() => setOpen(!open)}
        ref={arrowRef}
        type="button"
      >
        <TemplateIcon
          color="currentColor"
          iconSize="24px"
          url={svgToDataURL(menuDown)}
        />
      </button>
      <div
        className={bodyClassName}
        ref={bodyRef}
        role="menu"
        tabIndex={-1}
        onClick={(e) => {
          if (
            e.target instanceof HTMLElement &&
            e.target.matches(`.${MENU_ITEM_CLASS}`)
          ) {
            setOpen(false);
            arrowRef.current?.focus();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            arrowRef.current?.focus();
          } else if (e.key === "Tab") {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            arrowRef.current?.focus();
          } else if (
            e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "Home" ||
            e.key === "End"
          ) {
            e.preventDefault();
            e.stopPropagation();
            moveFocus(e.currentTarget, e.key);
          }
        }}
      >
        {menu}
      </div>
    </div>
  );
};

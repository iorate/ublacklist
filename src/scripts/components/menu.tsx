import dotsVertical from '@mdi/svg/svg/dots-vertical.svg';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MENU_ITEM_CLASS, MENU_Z_INDEX } from './constants';
import { applyClass } from './helpers';
import { IconButton } from './icon-button';
import { useCSS } from './styles';
import { useTheme } from './theme';

function moveFocus(body: HTMLDivElement, key: 'ArrowUp' | 'ArrowDown' | 'Home' | 'End') {
  const items = [...body.querySelectorAll<HTMLElement>(`.${MENU_ITEM_CLASS}`)] as const;
  if (!items.length) {
    return;
  }
  const currentIndex = (items as readonly (Element | null)[]).indexOf(document.activeElement);
  let nextIndex: number;
  if (key === 'ArrowUp') {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
  } else if (key === 'ArrowDown') {
    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
  } else if (key === 'Home') {
    nextIndex = 0;
  } else {
    nextIndex = items.length - 1;
  }
  const nextItem = items[nextIndex];
  nextItem.focus();
}

export type MenuProps = { buttonLabel?: string; disabled?: boolean } & JSX.IntrinsicElements['div'];

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { buttonLabel = '', disabled = false, ...props },
  ref,
) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (open) {
      bodyRef.current?.focus();
    }
  }, [open]);

  const css = useCSS();
  const theme = useTheme();
  const menuClass = useMemo(
    () =>
      css({
        outline: 'none',
        position: 'relative',
      }),
    [css],
  );
  const bodyClass = useMemo(
    () =>
      css({
        background: theme.menu.itemListBackground,
        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 2px 0px, rgba(0, 0, 0, 0.15) 0px 3px 6px 2px',
        display: open ? 'block' : 'none',
        minWidth: '10em',
        outline: 'none',
        padding: '0.75em 0',
        position: 'absolute',
        top: '100%',
        right: 0,
        zIndex: MENU_Z_INDEX,
      }),
    [css, theme, open],
  );

  return (
    <div
      {...applyClass(props, menuClass)}
      ref={ref}
      tabIndex={-1 /* Capture focus when the button is clicked in Safari */}
      onBlurCapture={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Element | null)) {
          setOpen(false);
        }
      }}
    >
      <IconButton
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={buttonLabel}
        disabled={disabled}
        iconURL={dotsVertical}
        ref={buttonRef}
        onClick={() => setOpen(!open)}
      />
      <div
        {...applyClass(props, bodyClass)}
        ref={bodyRef}
        role="menu"
        tabIndex={-1}
        onClick={e => {
          if (e.target instanceof HTMLElement && e.target.matches(`.${MENU_ITEM_CLASS}`)) {
            setOpen(false);
            buttonRef.current?.focus();
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            buttonRef.current?.focus();
          } else if (
            e.key === 'ArrowUp' ||
            e.key === 'ArrowDown' ||
            e.key === 'Home' ||
            e.key === 'End'
          ) {
            e.preventDefault();
            moveFocus(e.currentTarget, e.key);
          }
        }}
      />
    </div>
  );
});

export type MenuItemProps = JSX.IntrinsicElements['button'];

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  props,
  ref,
) {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        background: 'transparent',
        border: 'none',
        color: theme.text.primary,
        cursor: 'pointer',
        display: 'block',
        font: 'inherit',
        height: '2.5em',
        padding: '0 2em',
        textAlign: 'start',
        width: '100%',
        '&:focus': {
          background: theme.menu.itemBackgroundFocused,
          outline: 'none',
        },
        '&:hover:not(:focus)': {
          background: theme.menu.itemBackgroundHovered,
        },
      }),
    [css, theme],
  );
  return (
    <button {...applyClass(props, `${MENU_ITEM_CLASS} ${class_}`)} ref={ref} role="menuitem" />
  );
});

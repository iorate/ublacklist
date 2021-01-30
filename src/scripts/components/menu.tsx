import dotsVertical from '@mdi/svg/svg/dots-vertical.svg';
import { JSX, createContext, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, StateUpdater, useContext, useMemo, useRef, useState } from 'preact/hooks';
import { MENU_ITEM_CLASS } from './constants';
import { FocusCircle, applyClass, useInnerRef, useModal } from './helpers';
import { TemplateIcon } from './icon';
import { useCSS } from './styles';
import { useTheme } from './theme';

type MenuContextValue = { open: boolean; setOpen: StateUpdater<boolean> };

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const value = useContext(MenuContext);
  if (!value) {
    throw new Error('useMenuContext: no matching provider');
  }
  return value;
}

export type MenuProps = JSX.IntrinsicElements['div'];

export const Menu = forwardRef((props: MenuProps, ref: Ref<HTMLDivElement>) => {
  const [open, setOpen] = useState(false);

  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        position: 'relative',
      }),
    [css],
  );

  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div {...applyClass(props, class_)} ref={ref} />
    </MenuContext.Provider>
  );
});

export type MenuButtonProps = JSX.IntrinsicElements['button'];

export const MenuButton = forwardRef((props: MenuButtonProps, ref: Ref<HTMLButtonElement>) => {
  const { setOpen } = useMenuContext();

  const css = useCSS();
  const theme = useTheme();
  const wrapperClass = useMemo(
    () =>
      css({
        position: 'relative',
      }),
    [css],
  );
  const buttonClass = useMemo(() => {
    return css({
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'block',
      height: '36px',
      padding: '6px',
      width: '36px',
      '&:disabled': {
        cursor: 'default',
        opacity: 0.38,
      },
      '&:focus': {
        outline: 'none',
      },
    });
  }, [css]);

  return (
    <div class={wrapperClass}>
      <button
        {...applyClass(props, buttonClass)}
        ref={ref}
        onClick={() => {
          setOpen(true);
        }}
      >
        <TemplateIcon color={theme.menu.dots} iconSize="24px" url={dotsVertical} />
      </button>
      <FocusCircle />
    </div>
  );
});

function moveFocus(menuBody: HTMLDivElement, backward: boolean) {
  const items = [...menuBody.querySelectorAll<HTMLElement>(`.${MENU_ITEM_CLASS}`)];
  if (!items.length) {
    return;
  }
  const currentItem = document.activeElement;
  if (!(currentItem instanceof HTMLElement)) {
    return;
  }
  const currentIndex = items.indexOf(currentItem);
  const nextIndex =
    currentIndex === -1
      ? backward
        ? items.length - 1
        : 0
      : backward
      ? (currentIndex + items.length - 1) % items.length
      : (currentIndex + 1) % items.length;
  const nextItem = items[nextIndex];
  nextItem.focus();
}

export type MenuBodyProps = JSX.IntrinsicElements['div'];

export const MenuBody = forwardRef((props: MenuBodyProps, ref: Ref<HTMLDivElement>) => {
  const { open, setOpen } = useMenuContext();
  const backdrop = useRef<HTMLDivElement>();
  const innerRef = useInnerRef(ref);
  useModal(open, () => innerRef.current.focus());

  const css = useCSS();
  const theme = useTheme();
  const wrapperClass = useMemo(
    () =>
      css({
        position: 'relative',
        zIndex: 100000,
      }),
    [css],
  );
  const backdropClass = useMemo(
    () =>
      css({
        background: 'transparent',
        display: open ? 'block' : 'none',
        height: '100%',
        left: 0,
        position: 'fixed',
        top: 0,
        width: '100%',
      }),
    [css, open],
  );
  const dialogClass = useMemo(
    () =>
      css({
        background: theme.menu.itemListBackground,
        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 2px 0px, rgba(0, 0, 0, 0.15) 0px 3px 6px 2px',
        display: open ? 'block' : 'none',
        minWidth: '10em',
        padding: '0.75em 0',
        position: 'absolute',
        top: 0,
        right: 0,
      }),
    [css, theme, open],
  );
  const bodyClass = useMemo(
    () =>
      css({
        outline: 'none',
      }),
    [css],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      class={wrapperClass}
      tabIndex={-1}
      onClick={e => {
        if (
          e.target === backdrop.current ||
          (e.target instanceof HTMLElement && e.target.matches(`.${MENU_ITEM_CLASS}`))
        ) {
          setOpen(false);
        }
      }}
      onKeyDown={e => {
        if (e.key === 'Escape' || e.key === 'Tab') {
          e.preventDefault();
          setOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveFocus(innerRef.current, false);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveFocus(innerRef.current, true);
        }
      }}
    >
      <div class={backdropClass} ref={backdrop} />
      <div aria-label="Menu" aria-modal={open} class={dialogClass} role="dialog">
        <div {...applyClass(props, bodyClass)} ref={innerRef} role="menu" tabIndex={-1} />
      </div>
    </div>
  );
});

export type MenuItemProps = JSX.IntrinsicElements['button'];

export const MenuItem = forwardRef((props: MenuItemProps, ref: Ref<HTMLButtonElement>) => {
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

import dotsVertical from '@mdi/svg/svg/dots-vertical.svg';
import { JSX, createContext, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, StateUpdater, useContext, useMemo, useState } from 'preact/hooks';
import { FocusCircle, applyClass, useInnerRef, useModal } from './helpers';
import { Icon } from './icon';
import { useCSS } from './styles';
import { useTheme } from './theme';

const MenuContext = createContext<{ open?: boolean; setOpen?: StateUpdater<boolean> }>({});

export type MenuProps = JSX.IntrinsicElements['div'];

export const Menu = forwardRef((props: MenuProps, ref: Ref<HTMLDivElement>) => {
  const [open, setOpen] = useState(false);

  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        height: '36px',
        position: 'relative',
        width: '36px',
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
  const { setOpen } = useContext(MenuContext);

  const css = useCSS();
  const theme = useTheme();
  const wrapperClass = useMemo(
    () =>
      css({
        left: 0,
        position: 'absolute',
        top: 0,
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
          setOpen?.(true);
        }}
      >
        <Icon color={theme.menu.dots} iconSize="24px" url={dotsVertical} />
      </button>
      <FocusCircle depth={0} size="36px" />
    </div>
  );
});

function moveFocus(body: HTMLDivElement, backward: boolean) {
  const items = [...body.querySelectorAll<HTMLElement>('.js-menu-item')];
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
  const { open, setOpen } = useContext(MenuContext);
  const innerRef = useInnerRef(ref);
  useModal(Boolean(open), () => innerRef.current.focus());

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
        bottom: 0,
        display: open ? 'block' : 'none',
        left: 0,
        position: 'fixed',
        right: 0,
        top: 0,
      }),
    [css, open],
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
        top: '36px',
        right: 0,
      }),
    [css, theme, open],
  );

  return (
    <div class={wrapperClass}>
      <div
        class={backdropClass}
        onClick={() => {
          setOpen?.(false);
        }}
      />
      <div
        {...applyClass(props, bodyClass)}
        ref={innerRef}
        tabIndex={0}
        onClick={e => {
          if (e.target instanceof HTMLElement && e.target.matches('.js-menu-item')) {
            setOpen?.(false);
          }
        }}
        onKeyDown={e => {
          if (e.isComposing) {
            return;
          }
          if (e.key === 'Escape' || e.key === 'Tab') {
            e.preventDefault();
            setOpen?.(false);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (innerRef.current) {
              moveFocus(innerRef.current, false);
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (innerRef.current) {
              moveFocus(innerRef.current, true);
            }
          }
        }}
      />
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
  return <button {...applyClass(props, `js-menu-item ${class_}`)} ref={ref} />;
});

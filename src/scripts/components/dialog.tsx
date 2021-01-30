import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from './constants';
import { applyClass, useInnerRef, useModal } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

function handleKeyDown(
  e: JSX.TargetedKeyboardEvent<HTMLDivElement>,
  dialog: HTMLDivElement,
  close: () => void,
): void {
  e.stopPropagation();
  if (e.isComposing) {
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
  } else if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (
        e.target === dialog ||
        (e.target instanceof HTMLElement && e.target.matches(`.${FOCUS_START_CLASS}`))
      ) {
        e.preventDefault();
        dialog.querySelector<HTMLElement>(`.${FOCUS_END_CLASS}`)?.focus();
      }
    } else {
      if (e.target instanceof HTMLElement && e.target.matches(`.${FOCUS_END_CLASS}`)) {
        e.preventDefault();
        dialog.querySelector<HTMLElement>(`.${FOCUS_START_CLASS}`)?.focus();
      }
    }
  }
}

export type DialogProps = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  close: () => void;
  open: boolean;
  width?: string;
} & JSX.IntrinsicElements['div'];

export const Dialog = forwardRef(
  ({ close, open, width = '480px', ...props }: DialogProps, ref: Ref<HTMLDivElement>) => {
    const innerRef = useInnerRef(ref);
    useModal(open, () =>
      innerRef.current.querySelector<HTMLElement>(`.${FOCUS_START_CLASS}`)?.focus(),
    );

    const css = useCSS();
    const theme = useTheme();
    const wrapperClass = useMemo(
      () =>
        css({
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.6)',
          display: open ? 'flex' : 'none',
          justifyContent: 'center',
          height: '100%',
          left: 0,
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 100000,
        }),
      [css, open],
    );
    const dialogClass = useMemo(
      () =>
        css({
          background: theme.dialog.background,
          borderRadius: '8px',
          boxShadow: '0 0 16px rgba(0, 0, 0, 0.12), 0 16px 16px rgba(0, 0, 0, 0.24)',
          maxWidth: '100%',
          outline: 'none',
          padding: '1.5em',
          position: 'relative',
          width,
        }),
      [css, theme, width],
    );

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        class={wrapperClass}
        tabIndex={-1}
        onClick={e => {
          if (e.target === e.currentTarget) {
            close();
          }
        }}
        onKeyDown={e => handleKeyDown(e, innerRef.current, close)}
        onKeyPress={e => e.stopPropagation()}
        onKeyUp={e => e.stopPropagation()}
      >
        <div {...applyClass(props, dialogClass)} aria-modal={open} ref={innerRef} role="dialog" />
      </div>
    );
  },
);

export type DialogHeaderProps = JSX.IntrinsicElements['div'];

export const DialogHeader = forwardRef((props: DialogHeaderProps, ref: Ref<HTMLDivElement>) => {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        marginBottom: '1em',
      }),
    [css],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

export type DialogTitleProps = JSX.IntrinsicElements['h1'];

export const DialogTitle = forwardRef(
  ({ children, ...props }: DialogTitleProps, ref: Ref<HTMLHeadingElement>) => {
    const css = useCSS();
    const class_ = useMemo(
      () =>
        css({
          fontSize: '1.125em',
          fontWeight: 'normal',
          margin: 0,
        }),
      [css],
    );
    return (
      <h1 {...applyClass(props, class_)} ref={ref}>
        {children}
      </h1>
    );
  },
);

export type DialogBodyProps = JSX.IntrinsicElements['div'];

export const DialogBody = forwardRef((props: DialogBodyProps, ref: Ref<HTMLDivElement>) => {
  return <div {...props} ref={ref} />;
});

export type DialogFooterProps = JSX.IntrinsicElements['div'];

export const DialogFooter = forwardRef((props: DialogFooterProps, ref: Ref<HTMLDivElement>) => {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        marginTop: '2em',
      }),
    [css],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

export type EmbeddedDialogProps = {
  close: () => void;
  width?: string;
} & JSX.IntrinsicElements['div'];

export const EmbeddedDialog = forwardRef(
  ({ close, width = 'auto', ...props }: EmbeddedDialogProps, ref: Ref<HTMLDivElement>) => {
    const innerRef = useInnerRef(ref);

    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(
      () =>
        css({
          background: theme.dialog.background,
          maxWidth: '100%',
          padding: '1.5em',
          width,
        }),
      [css, theme, width],
    );

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        {...applyClass(props, class_)}
        ref={innerRef}
        tabIndex={-1}
        onKeyDown={e => handleKeyDown(e, innerRef.current, close)}
      />
    );
  },
);

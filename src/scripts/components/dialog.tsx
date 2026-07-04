import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import React from "react";
import styles from "./dialog.module.css";

export type DialogProps = React.JSX.IntrinsicElements["div"] & {
  close: () => void;
  container?: HTMLElement | ShadowRoot;
  initialFocus?: React.RefObject<HTMLElement | null>;
  open: boolean;
  width?: string;
};

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(
    {
      children,
      className,
      close,
      container,
      initialFocus,
      open,
      style,
      width = "480px",
      ...props
    },
    ref,
  ) {
    return (
      <BaseDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            close();
          }
        }}
      >
        <BaseDialog.Portal container={container}>
          <BaseDialog.Backdrop className={styles.backdrop} />
          <BaseDialog.Viewport className={styles.viewport}>
            <BaseDialog.Popup
              {...props}
              className={clsx(styles.popup, className)}
              initialFocus={initialFocus}
              ref={ref}
              style={{ width, ...style }}
            >
              {children}
            </BaseDialog.Popup>
          </BaseDialog.Viewport>
        </BaseDialog.Portal>
      </BaseDialog.Root>
    );
  },
);

export type DialogHeaderProps = React.JSX.IntrinsicElements["div"];

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, ...props }, ref) {
    return (
      <div {...props} className={clsx(styles.header, className)} ref={ref} />
    );
  },
);

export type DialogTitleProps = React.JSX.IntrinsicElements["h2"];

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <BaseDialog.Title
      {...props}
      className={clsx(styles.title, className)}
      ref={ref}
    />
  );
});

export type DialogBodyProps = React.JSX.IntrinsicElements["div"];

export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  function DialogBody(props, ref) {
    return <div {...props} ref={ref} />;
  },
);

export type DialogFooterProps = React.JSX.IntrinsicElements["div"];

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div {...props} className={clsx(styles.footer, className)} ref={ref} />
    );
  },
);

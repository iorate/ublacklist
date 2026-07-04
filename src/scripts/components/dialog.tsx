import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import type React from "react";
import styles from "./dialog.module.css";

export type DialogProps = React.JSX.IntrinsicElements["div"] & {
  close: () => void;
  container?: HTMLElement | ShadowRoot;
  initialFocus?: React.RefObject<HTMLElement | null>;
  open: boolean;
  width?: string;
};

export function Dialog({
  children,
  className,
  close,
  container,
  initialFocus,
  open,
  style,
  width = "480px",
  ...props
}: DialogProps) {
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
            style={{ width, ...style }}
          >
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export type DialogHeaderProps = React.JSX.IntrinsicElements["div"];

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div {...props} className={clsx(styles.header, className)} />;
}

export type DialogTitleProps = React.JSX.IntrinsicElements["h2"];

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title {...props} className={clsx(styles.title, className)} />
  );
}

export type DialogBodyProps = React.JSX.IntrinsicElements["div"];

export function DialogBody(props: DialogBodyProps) {
  return <div {...props} />;
}

export type DialogFooterProps = React.JSX.IntrinsicElements["div"];

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div {...props} className={clsx(styles.footer, className)} />;
}

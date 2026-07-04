import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import React from "react";
import styles from "./dialog.module.css";
import { applyClassName } from "./helpers.tsx";

export type DialogProps = React.JSX.IntrinsicElements["div"] & {
  close: () => void;
  open: boolean;
  width?: string;
};

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(
    { children, close, open, style, width = "480px", ...props },
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
        <BaseDialog.Portal>
          <BaseDialog.Backdrop className={styles.backdrop} />
          <BaseDialog.Viewport className={styles.viewport}>
            <BaseDialog.Popup
              {...applyClassName(props, styles.popup ?? "")}
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
  function DialogHeader(props, ref) {
    return <div {...applyClassName(props, styles.header ?? "")} ref={ref} />;
  },
);

export type DialogTitleProps = React.JSX.IntrinsicElements["h2"];

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(function DialogTitle(props, ref) {
  return (
    <BaseDialog.Title
      {...applyClassName(props, styles.title ?? "")}
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
  function DialogFooter(props, ref) {
    return <div {...applyClassName(props, styles.footer ?? "")} ref={ref} />;
  },
);

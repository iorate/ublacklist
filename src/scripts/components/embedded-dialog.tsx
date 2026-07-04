import clsx from "clsx";
import type React from "react";
import { useEffect } from "react";
import styles from "./embedded-dialog.module.css";

export type EmbeddedDialogProps = React.JSX.IntrinsicElements["div"] & {
  close: () => void;
  initialFocus?: React.RefObject<HTMLElement | null>;
};

export function EmbeddedDialog({
  className,
  close,
  initialFocus,
  ...props
}: EmbeddedDialogProps) {
  useEffect(() => {
    initialFocus?.current?.focus();
  }, [initialFocus]);
  return (
    <div
      {...props}
      className={clsx(
        styles.dialog,
        process.env.BROWSER === "safari" ? styles.safari : styles.standard,
        className,
      )}
      role="dialog"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.nativeEvent.isComposing) {
          e.preventDefault();
          close();
        }
      }}
    />
  );
}

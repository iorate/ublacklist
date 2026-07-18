import clsx from "clsx";
import type React from "react";
import { useEffect } from "react";
import styles from "./dialog.module.css";

export type PopupDialogProps = React.ComponentProps<"div"> & {
  close: () => void;
  initialFocus?: React.RefObject<HTMLElement | null>;
};

export function PopupDialog({
  className,
  close,
  initialFocus,
  ...props
}: PopupDialogProps) {
  useEffect(() => {
    initialFocus?.current?.focus();
    if (
      process.env.BROWSER === "safari" &&
      document.visibilityState === "hidden"
    ) {
      const refocus = () => initialFocus?.current?.focus();
      document.addEventListener("visibilitychange", refocus, { once: true });
      return () => document.removeEventListener("visibilitychange", refocus);
    }
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

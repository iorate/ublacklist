import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import sharedStyles from "../styles/dialog.module.css";
import styles from "./dialog.module.css";
import { mergeClassNames, mergeStyle } from "./merge-props.ts";

export type DialogProps = BaseDialog.Popup.Props & {
  close: () => void;
  container?: HTMLElement | ShadowRoot;
  open: boolean;
  width?: string;
};

export function Dialog({
  children,
  className,
  close,
  container,
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
            className={mergeClassNames(className, styles.popup)}
            style={mergeStyle(style, { width })}
          >
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export type DialogTitleProps = BaseDialog.Title.Props;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title
      {...props}
      className={mergeClassNames(className, sharedStyles.title)}
    />
  );
}

import { Menu as BaseMenu } from "@base-ui/react/menu";
import menuDown from "@mdi/svg/svg/menu-down.svg";
import clsx from "clsx";
import type React from "react";
import buttonStyles from "../styles/button.module.css";
import menuStyles from "./menu.module.css";
import styles from "./split-button.module.css";
import { SvgIcon } from "./svg-icon.tsx";

export type SplitButtonProps = React.JSX.IntrinsicElements["button"] & {
  menu: React.ReactNode;
  menuAriaLabel: string;
  menuDisabled?: boolean;
  portalContainer?: HTMLElement | ShadowRoot | undefined;
  primary?: boolean;
};

export function SplitButton({
  className,
  menu,
  menuAriaLabel,
  menuDisabled = false,
  portalContainer,
  primary = false,
  ...props
}: SplitButtonProps) {
  const variantClassName = primary
    ? buttonStyles.primary
    : buttonStyles.secondary;
  return (
    <div className={styles.wrapper}>
      <button
        {...props}
        className={clsx(
          buttonStyles.button,
          variantClassName,
          styles.main,
          className,
        )}
        type="button"
      />
      <BaseMenu.Root highlightItemOnHover={false} modal={false}>
        <BaseMenu.Trigger
          aria-label={menuAriaLabel}
          className={clsx(
            buttonStyles.button,
            variantClassName,
            styles.arrow,
            primary && styles.arrowPrimary,
          )}
          disabled={menuDisabled}
        >
          <SvgIcon svg={menuDown} />
        </BaseMenu.Trigger>
        <BaseMenu.Portal container={portalContainer}>
          <BaseMenu.Positioner
            align="end"
            className={styles.positioner}
            sideOffset={4}
          >
            <BaseMenu.Popup className={menuStyles.popup}>{menu}</BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    </div>
  );
}

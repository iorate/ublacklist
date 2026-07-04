import { Menu as BaseMenu } from "@base-ui/react/menu";
import dotsVertical from "@mdi/svg/svg/dots-vertical.svg";
import clsx from "clsx";
import type React from "react";
import iconButtonStyles from "./icon-button.module.css";
import styles from "./menu.module.css";
import { SvgIcon } from "./svg-icon.tsx";

export type MenuProps = React.JSX.IntrinsicElements["button"] & {
  children?: React.ReactNode;
  disabled?: boolean;
};

export function Menu({ children, disabled = false, ...props }: MenuProps) {
  return (
    <BaseMenu.Root highlightItemOnHover={false} modal={false}>
      <BaseMenu.Trigger
        {...props}
        disabled={disabled}
        render={
          <button className={iconButtonStyles.button} type="button">
            <SvgIcon
              color="var(--ub-color-text-secondary)"
              svg={dotsVertical}
            />
          </button>
        }
      />
      <BaseMenu.Portal>
        <BaseMenu.Positioner align="end" className={styles.positioner}>
          <BaseMenu.Popup className={styles.popup}>{children}</BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export type MenuItemProps = React.JSX.IntrinsicElements["div"] & {
  disabled?: boolean;
};

export function MenuItem({ className, ...props }: MenuItemProps) {
  return <BaseMenu.Item {...props} className={clsx(styles.item, className)} />;
}

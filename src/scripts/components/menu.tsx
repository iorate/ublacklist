import { Menu as BaseMenu } from "@base-ui/react/menu";
import dotsVertical from "@mdi/svg/svg/dots-vertical.svg";
import type React from "react";
import iconButtonStyles from "../styles/icon-button.module.css";
import styles from "./menu.module.css";
import { mergeClassNames } from "./merge-props.ts";
import { SvgIcon } from "./svg-icon.tsx";

export type MenuProps = Omit<BaseMenu.Trigger.Props, "children"> & {
  children?: React.ReactNode;
};

export function Menu({ children, ...props }: MenuProps) {
  return (
    <BaseMenu.Root highlightItemOnHover={false} modal={false}>
      <BaseMenu.Trigger
        {...props}
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

export type MenuItemProps = BaseMenu.Item.Props;

export function MenuItem({ className, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item
      {...props}
      className={mergeClassNames(className, styles.item)}
    />
  );
}

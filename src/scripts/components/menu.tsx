import { Menu as BaseMenu } from "@base-ui/react/menu";
import dotsVertical from "@mdi/svg/svg/dots-vertical.svg";
import type React from "react";
import { svgToDataURL } from "../shared/utilities.ts";
import { applyClassName } from "./helpers.tsx";
import { TemplateIcon } from "./icon.tsx";
import iconButtonStyles from "./icon-button.module.css";
import styles from "./menu.module.css";

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
            <TemplateIcon
              color="var(--ub-color-text-secondary)"
              iconSize="24px"
              url={svgToDataURL(dotsVertical)}
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

export function MenuItem(props: MenuItemProps) {
  return <BaseMenu.Item {...applyClassName(props, styles.item ?? "")} />;
}

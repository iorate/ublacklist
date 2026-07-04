import { Select as BaseSelect } from "@base-ui/react/select";
import menuDown from "@mdi/svg/svg/menu-down.svg";
import React from "react";
import { svgToDataURL } from "../shared/utilities.ts";
import { applyClassName } from "./helpers.tsx";
import { TemplateIcon } from "./icon.tsx";
import styles from "./select.module.css";

export type SelectProps = Omit<
  React.JSX.IntrinsicElements["button"],
  "value"
> & {
  children?: React.ReactNode;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  value?: string;
};

export function Select({
  children,
  disabled = false,
  onValueChange,
  value,
  ...props
}: SelectProps) {
  const items = React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<SelectOptionProps>(child) && child.props.value != null
      ? [{ value: child.props.value, label: child.props.children }]
      : [],
  );
  return (
    <BaseSelect.Root
      disabled={disabled}
      items={items}
      value={value}
      onValueChange={(newValue) => {
        if (newValue != null) {
          onValueChange?.(newValue);
        }
      }}
    >
      <BaseSelect.Trigger {...applyClassName(props, styles.trigger ?? "")}>
        <BaseSelect.Value className={styles.value ?? ""} />
        <BaseSelect.Icon className={styles.icon ?? ""}>
          <TemplateIcon
            color="var(--ub-color-text-secondary)"
            iconSize="24px"
            url={svgToDataURL(menuDown)}
          />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          alignItemWithTrigger={false}
          className={styles.positioner ?? ""}
        >
          <BaseSelect.Popup className={styles.popup ?? ""}>
            {children}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

export type SelectOptionProps = Omit<
  React.JSX.IntrinsicElements["div"],
  "value"
> & {
  disabled?: boolean;
  value?: string;
};

export function SelectOption({ children, ...props }: SelectOptionProps) {
  return (
    <BaseSelect.Item {...applyClassName(props, styles.item ?? "")}>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

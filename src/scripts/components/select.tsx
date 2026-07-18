import { Select as BaseSelect } from "@base-ui/react/select";
import menuDown from "@mdi/svg/svg/menu-down.svg";
import React from "react";
import { mergeClassNames } from "./merge-props.ts";
import styles from "./select.module.css";
import { SvgIcon } from "./svg-icon.tsx";

export type SelectProps = Omit<
  BaseSelect.Trigger.Props,
  "children" | "value"
> & {
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
};

export function Select({
  children,
  className,
  value,
  onValueChange,
  ...props
}: SelectProps) {
  const items = React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<SelectOptionProps>(child) && child.props.value != null
      ? [{ value: child.props.value, label: child.props.children }]
      : [],
  );
  return (
    <BaseSelect.Root
      items={items}
      value={value}
      onValueChange={(newValue) => {
        if (newValue != null) {
          onValueChange?.(newValue);
        }
      }}
    >
      <BaseSelect.Trigger
        {...props}
        className={mergeClassNames(className, styles.trigger)}
      >
        <BaseSelect.Value className={styles.value} />
        <BaseSelect.Icon className={styles.icon}>
          <SvgIcon color="var(--ub-color-text-secondary)" svg={menuDown} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          alignItemWithTrigger={false}
          className={styles.positioner}
        >
          <BaseSelect.Popup className={styles.popup}>
            {children}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

export type SelectOptionProps = Omit<BaseSelect.Item.Props, "value"> & {
  value?: string;
};

export function SelectOption({
  children,
  className,
  ...props
}: SelectOptionProps) {
  return (
    <BaseSelect.Item
      {...props}
      className={mergeClassNames(className, styles.item)}
    >
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

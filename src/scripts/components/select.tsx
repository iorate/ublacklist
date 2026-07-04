import { Select as BaseSelect } from "@base-ui/react/select";
import menuDown from "@mdi/svg/svg/menu-down.svg";
import clsx from "clsx";
import React from "react";
import styles from "./select.module.css";
import { SvgIcon } from "./svg-icon.tsx";

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
  className,
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
      <BaseSelect.Trigger
        {...props}
        className={clsx(styles.trigger, className)}
      >
        <BaseSelect.Value className={styles.value ?? ""} />
        <BaseSelect.Icon className={styles.icon ?? ""}>
          <SvgIcon color="var(--ub-color-text-secondary)" svg={menuDown} />
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

export function SelectOption({
  children,
  className,
  ...props
}: SelectOptionProps) {
  return (
    <BaseSelect.Item {...props} className={clsx(styles.item, className)}>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

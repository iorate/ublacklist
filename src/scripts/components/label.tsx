import clsx from "clsx";
import type React from "react";
import { applyClassName } from "./helpers.tsx";
import styles from "./label.module.css";

export type LabelWrapperProps = React.JSX.IntrinsicElements["div"] & {
  disabled?: boolean;
  fullWidth?: boolean;
};

export function LabelWrapper({
  disabled = false,
  fullWidth = false,
  ...props
}: LabelWrapperProps) {
  const className = clsx(
    styles.wrapper,
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
  );
  return <div {...applyClassName(props, className)} />;
}

export type LabelProps = React.JSX.IntrinsicElements["span"];

export function Label(props: LabelProps) {
  return (
    <div>
      <span {...applyClassName(props, styles.label ?? "")} />
    </div>
  );
}

export type ControlLabelProps = {
  for: string;
} & React.JSX.IntrinsicElements["label"];

export function ControlLabel({
  children,
  for: for_,
  ...props
}: ControlLabelProps) {
  return (
    <div>
      <label
        {...applyClassName(props, styles.controlLabel ?? "")}
        htmlFor={for_}
      >
        {children}
      </label>
    </div>
  );
}

export type SubLabelProps = React.JSX.IntrinsicElements["span"];

export function SubLabel(props: SubLabelProps) {
  return (
    <div>
      <span {...applyClassName(props, styles.subLabel ?? "")} />
    </div>
  );
}

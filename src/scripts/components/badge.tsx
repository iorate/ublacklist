import React from "react";
import styles from "./badge.module.css";
import { applyClassName } from "./helpers.tsx";

export type BadgeProps = React.JSX.IntrinsicElements["span"];

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(props, ref) {
    return <span {...applyClassName(props, styles.badge ?? "")} ref={ref} />;
  },
);

import React from "react";
import { DISABLED_OPACITY } from "./constants.ts";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type InputProps = JSX.IntrinsicElements["input"];

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const className = useClassName(
      (theme) => ({
        background: "transparent",
        border: `solid 1px ${theme.input.border}`,
        borderRadius: "4px",
        color: theme.text.primary,
        display: "block",
        font: "inherit",
        lineHeight: "1.5",
        padding: "0.5em 0.625em",
        width: "100%",
        "&:disabled": {
          opacity: DISABLED_OPACITY,
        },
        "&:focus": {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
          outline: "none",
        },
      }),
      [],
    );
    return <input {...applyClassName(props, className)} ref={ref} />;
  },
);

import React from "react";
import { DISABLED_OPACITY } from "./constants.ts";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type TextAreaProps = JSX.IntrinsicElements["textarea"] & {
  breakAll?: boolean;
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ breakAll = false, ...props }, ref) {
    const className = useClassName(
      (theme) => ({
        background: "transparent",
        border: `solid 1px ${theme.textArea.border}`,
        borderRadius: "4px",
        color: theme.text.primary,
        display: "block",
        font: "inherit",
        height:
          props.rows != null
            ? `calc(1.5em * ${props.rows} + 1em + 2px)`
            : "auto",
        lineHeight: "1.5",
        padding: "0.5em 0.625em",
        resize: "none",
        width: "100%",
        wordBreak: breakAll ? "break-all" : "normal",
        "&:disabled": {
          opacity: DISABLED_OPACITY,
        },
        "&:focus": {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
          outline: "none",
        },
        "&:read-only": {
          color: theme.text.secondary,
        },
      }),
      [breakAll, props.rows],
    );

    return <textarea {...applyClassName(props, className)} ref={ref} />;
  },
);

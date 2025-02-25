import React from "react";
import { DISABLED_OPACITY } from "./constants.ts";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type TextAreaProps = React.JSX.IntrinsicElements["textarea"] & {
  breakAll?: boolean;
  resizable?: boolean;
  monospace?: boolean;
  nowrap?: boolean;
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      breakAll = false,
      resizable = false,
      monospace = false,
      nowrap = false,
      ...props
    },
    ref,
  ) {
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
        fontFamily: monospace ? "monospace" : "inherit",
        textWrap: nowrap ? "nowrap" : "wrap",
        padding: "0.5em 0.625em",
        resize: resizable ? "vertical" : "none",
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

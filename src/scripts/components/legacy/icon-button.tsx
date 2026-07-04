import React from "react";
import { DISABLED_OPACITY } from "../constants.ts";
import { applyClassName } from "../helpers.tsx";
import { useTheme } from "../theme.tsx";
import { useClassName } from "../utilities.ts";
import { FocusCircle } from "./helpers.tsx";
import { TemplateIcon } from "./icon.tsx";

export type IconButtonProps = React.JSX.IntrinsicElements["button"] & {
  iconURL: string;
  compact?: boolean;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ iconURL, compact = false, ...props }, ref) {
    const theme = useTheme();
    const wrapperClassName = useClassName(
      () => ({
        height: compact ? "24px" : "36px",
        position: "relative",
        width: compact ? "24px" : "36px",
      }),
      [compact],
    );
    const buttonClassName = useClassName(
      () => ({
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "block",
        height: "100%",
        padding: compact ? 0 : "6px",
        width: "100%",
        "&:disabled": {
          cursor: "default",
          opacity: DISABLED_OPACITY,
        },
        "&:focus": {
          outline: "none",
        },
      }),
      [compact],
    );
    return (
      <div className={wrapperClassName}>
        <button {...applyClassName(props, buttonClassName)} ref={ref}>
          <TemplateIcon
            color={theme.iconButton}
            iconSize="24px"
            url={iconURL}
          />
        </button>
        <FocusCircle />
      </div>
    );
  },
);

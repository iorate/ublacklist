import React from "react";
import { DISABLED_OPACITY } from "./constants.ts";
import { applyClassName, FocusCircle } from "./helpers.tsx";
import { TemplateIcon } from "./icon.tsx";
import { useTheme } from "./theme.tsx";
import { useClassName } from "./utilities.ts";

export type IconButtonProps = React.JSX.IntrinsicElements["button"] & {
  iconURL: string;
  compact?: boolean;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ iconURL, compact = false, ...props }, ref) {
    const theme = useTheme();
    const wrapperClassName = useClassName(
      () => ({
        position: "relative",
      }),
      [],
    );
    const buttonClassName = useClassName(
      () => ({
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "block",
        height: compact ? "24px" : "36px",
        padding: compact ? 0 : "6px",
        width: compact ? "24px" : "36px",
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

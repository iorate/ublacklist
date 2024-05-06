import React from "react";
import { DISABLED_OPACITY, INPUT_Z_INDEX } from "./constants.ts";
import { FocusCircle, applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type RadioButtonProps = JSX.IntrinsicElements["input"];

export const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const wrapperClassName = useClassName(
      () => ({
        height: "16px",
        position: "relative",
        width: "16px",
      }),
      [],
    );
    const inputClassName = useClassName(
      () => ({
        cursor: "pointer",
        height: "100%",
        margin: 0,
        opacity: 0,
        position: "absolute",
        width: "100%",
        zIndex: INPUT_Z_INDEX,
        "&:disabled": {
          cursor: "default",
        },
      }),
      [],
    );
    const imageClassName = useClassName(
      () => ({
        ":disabled + &": {
          opacity: DISABLED_OPACITY,
        },
      }),
      [],
    );
    const circleClassName = useClassName(
      (theme) => ({
        border: `solid 2px ${theme.radioButton.unchecked}`,
        borderRadius: "50%",
        height: "16px",
        left: 0,
        position: "absolute",
        top: 0,
        width: "16px",
        ":checked + * > &": {
          borderColor: theme.radioButton.checked,
        },
      }),
      [],
    );
    const dotClassName = useClassName(
      (theme) => ({
        borderRadius: "50%",
        height: "8px",
        left: "4px",
        position: "absolute",
        top: "4px",
        width: "8px",
        ":checked + * > &": {
          backgroundColor: theme.radioButton.checked,
        },
      }),
      [],
    );
    return (
      <div className={wrapperClassName}>
        <input
          {...applyClassName(props, inputClassName)}
          ref={ref}
          type="radio"
        />
        <div className={imageClassName}>
          <div className={circleClassName} />
          <div className={dotClassName} />
          <FocusCircle depth={1} />
        </div>
      </div>
    );
  },
);

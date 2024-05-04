import React from "react";
import { DISABLED_OPACITY, INPUT_Z_INDEX } from "./constants.ts";
import { FocusCircle, applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type SwitchProps = JSX.IntrinsicElements["input"];

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, ref) {
    const wrapperClassName = useClassName(
      () => ({
        height: "16px",
        position: "relative",
        width: "34px",
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
    const backgroundClassName = useClassName(
      () => ({
        ":disabled + &": {
          opacity: DISABLED_OPACITY,
        },
      }),
      [],
    );
    const barClassName = useClassName(
      (theme) => ({
        background: theme.switch.bar,
        borderRadius: "8px",
        height: "12px",
        left: "3px",
        position: "absolute",
        top: "2px",
        transition: "background-color linear 80ms",
        width: "28px",
        ":checked + * > &": {
          background: theme.switch.barChecked,
        },
      }),
      [],
    );
    const knobMoverClassName = useClassName(
      () => ({
        left: 0,
        position: "absolute",
        top: 0,
        transition: "left linear 80ms",
        ":checked + * > &": {
          left: "18px",
        },
      }),
      [],
    );
    const knobClassName = useClassName(
      (theme) => ({
        background: theme.switch.knob,
        border:
          theme.switch.knobBorder != null
            ? `solid 1px ${theme.switch.knobBorder}`
            : "none",
        borderRadius: "50%",
        height: "16px",
        transition: "background linear 80ms, border linear 80ms",
        width: "16px",
        ":checked + * > * > &": {
          background: theme.switch.knobChecked,
          border: "none",
        },
      }),
      [],
    );
    return (
      <div className={wrapperClassName}>
        <input
          {...applyClassName(props, inputClassName)}
          ref={ref}
          type="checkbox"
        />
        <div className={backgroundClassName}>
          <div className={barClassName} />
          <div className={knobMoverClassName}>
            <div className={knobClassName} />
            <FocusCircle depth={2} />
          </div>
        </div>
      </div>
    );
  },
);

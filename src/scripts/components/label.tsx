import React, { useContext } from "react";
import { DISABLED_OPACITY } from "./constants.ts";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

type LabelContextValue = { disabled: boolean };

const LabelContext = React.createContext<LabelContextValue | null>(null);

function useLabelContext(): LabelContextValue {
  const value = useContext(LabelContext);
  if (!value) {
    throw new Error("useLabelContext: no matching provider");
  }
  return value;
}

export type LabelWrapperProps = JSX.IntrinsicElements["div"] & {
  disabled?: boolean;
  fullWidth?: boolean;
};

export const LabelWrapper = React.forwardRef<HTMLDivElement, LabelWrapperProps>(
  function LabelWrapper(
    { disabled = false, fullWidth = false, ...props },
    ref,
  ) {
    const className = useClassName(
      () => ({
        marginBottom: fullWidth ? "0.5em" : 0,
        opacity: disabled ? DISABLED_OPACITY : 1,
      }),
      [disabled, fullWidth],
    );
    return (
      <LabelContext.Provider value={{ disabled }}>
        <div {...applyClassName(props, className)} ref={ref} />
      </LabelContext.Provider>
    );
  },
);

export type LabelProps = JSX.IntrinsicElements["span"];

export const Label = React.forwardRef<HTMLSpanElement, LabelProps>(
  function Label(props, ref) {
    const { disabled } = useLabelContext();

    const className = useClassName(
      (theme) => ({
        color: theme.text.primary,
        cursor: disabled ? "default" : "auto",
      }),
      [disabled],
    );

    return (
      <div>
        <span {...applyClassName(props, className)} ref={ref} />
      </div>
    );
  },
);

export type ControlLabelProps = {
  for: string;
} & JSX.IntrinsicElements["label"];

export const ControlLabel = React.forwardRef<
  HTMLLabelElement,
  ControlLabelProps
>(function ControlLabel({ children, for: for_, ...props }, ref) {
  const { disabled } = useLabelContext();

  const className = useClassName(
    (theme) => ({
      color: theme.text.primary,
      cursor: disabled ? "default" : "pointer",
    }),
    [disabled],
  );

  return (
    <div>
      <label {...applyClassName(props, className)} htmlFor={for_} ref={ref}>
        {children}
      </label>
    </div>
  );
});

export type SubLabelProps = JSX.IntrinsicElements["span"];

export const SubLabel = React.forwardRef<HTMLSpanElement, SubLabelProps>(
  function SubLabel(props, ref) {
    const { disabled } = useLabelContext();

    const className = useClassName(
      (theme) => ({
        color: theme.text.secondary,
        cursor: disabled ? "default" : "auto",
      }),
      [disabled],
    );

    return (
      <div>
        <span {...applyClassName(props, className)} ref={ref} />
      </div>
    );
  },
);

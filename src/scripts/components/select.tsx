import menuDown from "@mdi/svg/svg/menu-down.svg";
import React, { useContext } from "react";
import { svgToDataURL } from "../utilities.ts";
import { DISABLED_OPACITY } from "./constants.ts";
import { applyClassName } from "./helpers.tsx";
import { TemplateIcon } from "./icon.tsx";
import { useTheme } from "./theme.tsx";
import { useClassName } from "./utilities.ts";

type SelectContextValue = { native: boolean };

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(): SelectContextValue {
  const value = useContext(SelectContext);
  if (!value) {
    throw new Error("useSelectContext: no matching provider");
  }
  return value;
}

export type SelectProps = JSX.IntrinsicElements["select"] & {
  native?: boolean;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ native = false, ...props }, ref) {
    const theme = useTheme();
    const wrapperClassName = useClassName(
      () => ({
        position: "relative",
      }),
      [],
    );
    const selectClassName = useClassName(
      (theme) => ({
        appearance: "none",
        WebkitAppearance: "none",
        background: "transparent",
        border: `solid 1px ${theme.select.border}`,
        borderRadius: "4px",
        color: theme.text.primary,
        cursor: "pointer",
        display: "block",
        font: "inherit",
        lineHeight: "1.5",
        padding: "0.5em calc(0.625em + 24px) 0.5em 0.625em",
        width: "15em",
        "&:disabled": {
          cursor: "default",
          opacity: DISABLED_OPACITY,
        },
        "&:focus": {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
          outline: "none",
        },
      }),
      [],
    );
    const arrowClassName = useClassName(
      () => ({
        pointerEvents: "none",
        position: "absolute",
        right: "1px",
        top: "calc((100% - 24px) / 2)",
      }),
      [],
    );
    return (
      <SelectContext.Provider value={{ native }}>
        <div className={wrapperClassName}>
          <select {...applyClassName(props, selectClassName)} ref={ref} />
          <div className={arrowClassName}>
            <TemplateIcon
              color={theme.select.arrow}
              iconSize="24px"
              url={svgToDataURL(menuDown)}
            />
          </div>
        </div>
      </SelectContext.Provider>
    );
  },
);

export type SelectOptionProps = JSX.IntrinsicElements["option"];

export const SelectOption = React.forwardRef<
  HTMLOptionElement,
  SelectOptionProps
>(function SelectOption(props, ref) {
  const { native } = useSelectContext();

  const className = useClassName(
    (theme) => ({
      background: native ? "transparent" : theme.select.optionBackground,
      color: native ? "initial" : "inherit",
    }),
    [native],
  );

  return <option {...applyClassName(props, className)} ref={ref} />;
});

import { colord } from "colord";
import React, { useLayoutEffect, useRef, useState } from "react";
import { HexColorInput, RgbaColorPicker } from "react-colorful";
import { COLOR_PICKER_Z_INDEX, DISABLED_OPACITY } from "./constants.ts";
import { applyClassName, useInnerRef } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type ColorPickerProps = Omit<
  JSX.IntrinsicElements["button"],
  "onChange"
> & {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker = React.forwardRef<
  HTMLButtonElement,
  ColorPickerProps
>(function ColorPicker({ disabled = false, value, onChange, ...props }, ref) {
  const [open, setOpen] = useState(false);
  const swatchRef = useInnerRef(ref);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open) {
      popoverRef.current?.focus();
    }
  }, [open]);

  const pickerClassName = useClassName(
    () => ({
      height: "36px",
      outline: "none",
      position: "relative",
      width: "36px",
    }),
    [],
  );
  const swatchClassName = useClassName(
    (theme) => ({
      border: `solid 2px ${theme.colorPicker.border}`,
      borderRadius: "25%",
      cursor: disabled ? "default" : "pointer",
      height: "36px",
      opacity: disabled ? DISABLED_OPACITY : 1,
      outline: "none",
      padding: 0,
      width: "36px",
      "&:focus": {
        boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
      },
      "&:focus:not(:focus-visible)": {
        boxShadow: "none",
      },
      "&:focus:not(:-moz-focusring)": {
        boxShadow: "none",
      },
    }),
    [disabled],
  );
  const popoverClassName = useClassName(
    (theme) => ({
      backgroundColor: theme.colorPicker.popoverBackground,
      borderRadius: "8px",
      boxShadow:
        "rgba(0, 0, 0, 0.3) 0px 1px 2px 0px, rgba(0, 0, 0, 0.15) 0px 3px 6px 2px",
      display: open ? "block" : "none",
      outline: "none",
      padding: "0.75em",
      position: "absolute",
      top: "100%",
      right: 0,
      zIndex: COLOR_PICKER_Z_INDEX,
    }),
    [open],
  );
  const inputClassName = useClassName(
    (theme) => ({
      background: "transparent",
      border: `solid 1px ${theme.input.border}`,
      borderRadius: "4px",
      color: theme.text.primary,
      display: "block",
      font: "inherit",
      height: "2.5em",
      lineHeight: "1.5",
      margin: "0.75em auto 0",
      padding: "0.5em 0.625em",
      textAlign: "center",
      width: "8em",
      "&:focus": {
        boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        outline: "none",
      },
    }),
    [],
  );

  return (
    <div
      className={pickerClassName}
      tabIndex={-1}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Element | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        {...applyClassName(props, swatchClassName)}
        aria-expanded={open}
        aria-haspopup="dialog"
        ref={swatchRef}
        style={{ backgroundColor: value }}
        type="button"
        onClick={() => setOpen(!open)}
      />
      <div
        className={popoverClassName}
        ref={popoverRef}
        // biome-ignore lint/a11y/useSemanticElements: to be replaced in the future
        role="dialog"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            swatchRef.current?.focus();
          }
        }}
      >
        <RgbaColorPicker
          color={colord(value).toRgb()}
          onChange={(value) => onChange(colord(value).toHex())}
        />
        <HexColorInput
          alpha
          className={inputClassName}
          color={colord(value).toHex()}
          prefixed
          onChange={onChange}
        />
      </div>
    </div>
  );
});

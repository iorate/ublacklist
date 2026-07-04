import { Popover } from "@base-ui/react/popover";
import { colord } from "colord";
import type React from "react";
import { HexColorInput, RgbaColorPicker } from "react-colorful";
import styles from "./color-picker.module.css";
import { applyClassName } from "./helpers.tsx";

export type ColorPickerProps = Omit<
  React.JSX.IntrinsicElements["button"],
  "onChange"
> & {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function ColorPicker({
  disabled = false,
  value,
  onChange,
  style,
  ...props
}: ColorPickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        {...applyClassName(props, styles.swatch ?? "")}
        disabled={disabled}
        style={{ backgroundColor: value, ...style }}
      />
      <Popover.Portal>
        <Popover.Positioner
          align="end"
          className={styles.positioner ?? ""}
          side="bottom"
        >
          <Popover.Popup className={styles.popup ?? ""}>
            <RgbaColorPicker
              color={colord(value).toRgb()}
              onChange={(newValue) => onChange(colord(newValue).toHex())}
            />
            <HexColorInput
              alpha
              className={styles.input ?? ""}
              color={colord(value).toHex()}
              prefixed
              onChange={onChange}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

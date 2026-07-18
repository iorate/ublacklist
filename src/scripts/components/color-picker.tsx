import { Popover } from "@base-ui/react/popover";
import { colord } from "colord";
import { HexColorInput, RgbaColorPicker } from "react-colorful";
import styles from "./color-picker.module.css";
import { mergeClassNames, mergeStyle } from "./merge-props.ts";

export type ColorPickerProps = Popover.Trigger.Props & {
  value: string;
  onValueChange: (value: string) => void;
};

export function ColorPicker({
  className,
  style,
  value,
  onValueChange,
  ...props
}: ColorPickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        {...props}
        className={mergeClassNames(className, styles.swatch)}
        style={mergeStyle(style, { backgroundColor: value })}
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
              onChange={(newValue) => onValueChange(colord(newValue).toHex())}
            />
            <HexColorInput
              alpha
              className={styles.input ?? ""}
              color={colord(value).toHex()}
              prefixed
              onChange={onValueChange}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

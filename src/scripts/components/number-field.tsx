import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import minus from "@mdi/svg/svg/minus.svg";
import plus from "@mdi/svg/svg/plus.svg";
import styles from "./number-field.module.css";
import { SvgIcon } from "./svg-icon.tsx";

export type NumberFieldProps = BaseNumberField.Root.Props & {
  "data-testid"?: string;
  decreaseLabel: string;
  increaseLabel: string;
};

export function NumberField({
  "data-testid": dataTestId,
  decreaseLabel,
  increaseLabel,
  ...props
}: NumberFieldProps) {
  return (
    <BaseNumberField.Root {...props}>
      <BaseNumberField.Group className={styles.group}>
        <BaseNumberField.Decrement
          aria-label={decreaseLabel}
          className={styles.button}
        >
          <SvgIcon color="var(--ub-color-text-secondary)" svg={minus} />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          className={styles.input}
          data-testid={dataTestId}
        />
        <BaseNumberField.Increment
          aria-label={increaseLabel}
          className={styles.button}
        >
          <SvgIcon color="var(--ub-color-text-secondary)" svg={plus} />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}

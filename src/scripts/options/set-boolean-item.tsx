import { Switch } from "@base-ui/react/switch";
import clsx from "clsx";
import labelStyles from "../components/label.module.css";
import rowStyles from "../components/row.module.css";
import styles from "../components/switch.module.css";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { storageStore } from "../shared/storage-store.ts";
import type { LocalStorageItems } from "../shared/types.ts";
import localStyles from "./set-boolean-item.module.css";

export type BooleanItemKey = keyof {
  [Key in keyof LocalStorageItems as boolean extends LocalStorageItems[Key]
    ? Key
    : never]: boolean;
};

export const SetBooleanItem: React.FC<{
  disabled?: boolean;
  itemKey: BooleanItemKey;
  label: string;
  subLabels?: readonly string[];
}> = ({ disabled = false, itemKey, label, subLabels = [] }) => {
  const item = storageStore.use[itemKey]();

  return (
    <div className={clsx(rowStyles.row, localStyles.row)}>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <div className={labelStyles.wrapper}>
          <label className={labelStyles.controlLabel} htmlFor={itemKey}>
            {label}
          </label>
          {subLabels.map((subLabel) => (
            <div className={labelStyles.subLabel} key={subLabel}>
              {subLabel}
            </div>
          ))}
        </div>
      </div>
      <div className={rowStyles.rowItem}>
        <Switch.Root
          checked={item}
          className={styles.switch}
          data-testid={itemKey}
          disabled={disabled}
          id={itemKey}
          onCheckedChange={(checked) => {
            void saveToLocalStorage(
              { [itemKey]: checked } as Partial<
                Record<BooleanItemKey, boolean>
              >,
              "options",
            );
          }}
        >
          <Switch.Thumb className={styles.thumb} />
        </Switch.Root>
      </div>
    </div>
  );
};

import { Switch } from "@base-ui/react/switch";
import { useMemo } from "react";
import { ControlLabel, LabelWrapper, SubLabel } from "../components/label.tsx";
import { Row, RowItem } from "../components/row.tsx";
import { useCSS } from "../components/styles.tsx";
import styles from "../components/switch.module.css";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { storageStore } from "../shared/storage-store.ts";
import type { LocalStorageItems } from "../shared/types.ts";

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

  const css = useCSS();
  const rowClass = useMemo(
    () =>
      css({
        "&&": {
          minHeight: "2.5em",
        },
      }),
    [css],
  );

  return (
    <Row className={rowClass}>
      <RowItem expanded>
        <LabelWrapper>
          <ControlLabel for={itemKey}>{label}</ControlLabel>
          {subLabels.map((subLabel) => (
            <SubLabel key={subLabel}>{subLabel}</SubLabel>
          ))}
        </LabelWrapper>
      </RowItem>
      <RowItem>
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
      </RowItem>
    </Row>
  );
};

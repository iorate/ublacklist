import clsx from "clsx";
import { useEffect, useState } from "react";
import { NumberField } from "../../components/number-field.tsx";
import {
  clampSyncInterval,
  clampUpdateInterval,
} from "../../shared/intervals.ts";
import { saveToLocalStorage } from "../../shared/local-storage.ts";
import { translate } from "../../shared/locales.ts";
import { storageStore } from "../../shared/storage-store.ts";
import labelStyles from "../../styles/label.module.css";
import rowStyles from "../../styles/row.module.css";
import { saveSource } from "./save-source.ts";
import localStyles from "./set-interval-item.module.css";

export type IntervalItemKey = "syncInterval" | "updateInterval";

export type IntervalUnit = "minute" | "day";

const clampIntervals: Record<IntervalItemKey, (minutes: number) => number> = {
  syncInterval: clampSyncInterval,
  updateInterval: clampUpdateInterval,
};

const minutesPerUnit: Record<IntervalUnit, number> = {
  minute: 1,
  day: 1440,
};

export function SetIntervalItem({
  itemKey,
  label,
  min,
  unit,
}: {
  itemKey: IntervalItemKey;
  label: string;
  min: number;
  unit: IntervalUnit;
}) {
  const storedMinutes = storageStore.use[itemKey]();
  const storedValue = Math.ceil(
    clampIntervals[itemKey](storedMinutes) / minutesPerUnit[unit],
  );
  const [value, setValue] = useState<number | null>(storedValue);

  useEffect(() => {
    setValue(storedValue);
  }, [storedValue]);

  return (
    <div className={clsx(rowStyles.row, localStyles.row)}>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <div className={labelStyles.wrapper}>
          <label className={labelStyles.controlLabel} htmlFor={itemKey}>
            {label}
          </label>
        </div>
      </div>
      <div className={rowStyles.rowItem}>
        <NumberField
          data-testid={itemKey}
          decreaseLabel={translate("options_decreaseIntervalButton")}
          id={itemKey}
          increaseLabel={translate("options_increaseIntervalButton")}
          min={min}
          value={value}
          onValueChange={setValue}
          onValueCommitted={(committedValue) => {
            if (committedValue == null) {
              setValue(storedValue);
              return;
            }
            void saveToLocalStorage(
              {
                [itemKey]:
                  Math.max(min, Math.round(committedValue)) *
                  minutesPerUnit[unit],
              } as Partial<Record<IntervalItemKey, number>>,
              saveSource,
            );
          }}
        />
      </div>
    </div>
  );
}

import clsx from "clsx";
import dayjs from "dayjs";
import labelStyles from "../../components/label.module.css";
import rowStyles from "../../components/row.module.css";
import "../../shared/dayjs-locales.ts";
import { Select, SelectOption } from "../../components/select.tsx";
import { saveToLocalStorage } from "../../shared/local-storage.ts";
import { translate } from "../../shared/locales.ts";
import { storageStore } from "../../shared/storage-store.ts";
import localStyles from "./set-interval-item.module.css";

export type IntervalItemKey = "syncInterval" | "updateInterval";

export function SetIntervalItem({
  disabled = false,
  itemKey,
  label,
  valueOptions,
}: {
  disabled?: boolean;
  itemKey: IntervalItemKey;
  label: string;
  valueOptions: readonly number[];
}) {
  const item = storageStore.use[itemKey]();

  valueOptions = [...new Set([...valueOptions, item])].sort((a, b) => a - b);

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
        <Select
          data-testid={itemKey}
          disabled={disabled}
          id={itemKey}
          value={String(item)}
          onValueChange={(value) => {
            void saveToLocalStorage(
              { [itemKey]: Number(value) } as Partial<
                Record<IntervalItemKey, number>
              >,
              "options",
            );
          }}
        >
          {valueOptions.map((value) => (
            <SelectOption
              data-testid={`${itemKey}-${value}`}
              key={value}
              value={String(value)}
            >
              {dayjs
                .duration({ minutes: value })
                .locale(translate("lang"))
                .humanize(false)}
            </SelectOption>
          ))}
        </Select>
      </div>
    </div>
  );
}

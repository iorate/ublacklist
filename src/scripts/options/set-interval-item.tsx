import dayjs from "dayjs";
import { ControlLabel, LabelWrapper } from "../components/label.tsx";
import { Row, RowItem } from "../components/row.tsx";
import { useClassName } from "../components/utilities.ts";
import "../shared/dayjs-locales.ts";
import { Select, SelectOption } from "../components/select.tsx";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { storageStore } from "../shared/storage-store.ts";

export type IntervalItemKey = "syncInterval" | "updateInterval";

export const SetIntervalItem: React.FC<{
  disabled?: boolean;
  itemKey: IntervalItemKey;
  label: string;
  valueOptions: readonly number[];
}> = ({ disabled = false, itemKey, label, valueOptions }) => {
  const item = storageStore.use[itemKey]();

  valueOptions = [...new Set([...valueOptions, item])].sort((a, b) => a - b);

  const rowClass = useClassName(
    () => ({
      "&&": {
        minHeight: "2.5em",
      },
    }),
    [],
  );

  return (
    <Row className={rowClass}>
      <RowItem expanded>
        <LabelWrapper>
          <ControlLabel for={itemKey}>{label}</ControlLabel>
        </LabelWrapper>
      </RowItem>
      <RowItem>
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
      </RowItem>
    </Row>
  );
};

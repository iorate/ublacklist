import dayjs from "dayjs";
import { useState } from "react";
import { ControlLabel, LabelWrapper } from "../components/label.tsx";
import { Row, RowItem } from "../components/row.tsx";
import { useClassName } from "../components/utilities.ts";
import "../dayjs-locales.ts";
import { saveToLocalStorage } from "../local-storage.ts";
import { translate } from "../locales.ts";
import { useOptionsContext } from "./options-context.tsx";
import { Select, SelectOption } from "./select.tsx";

export type IntervalItemKey = "syncInterval" | "updateInterval";

export const SetIntervalItem: React.FC<{
  disabled?: boolean;
  itemKey: IntervalItemKey;
  label: string;
  valueOptions: readonly number[];
}> = ({ disabled = false, itemKey, label, valueOptions }) => {
  const {
    initialItems: { [itemKey]: initialItem },
  } = useOptionsContext();
  const [item, setItem] = useState(initialItem);

  valueOptions = [...new Set([...valueOptions, initialItem])].sort(
    (a, b) => a - b,
  );

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
          disabled={disabled}
          id={itemKey}
          value={item}
          onChange={(e) => {
            const value = Number(e.currentTarget.value);
            void saveToLocalStorage(
              { [itemKey]: value } as Partial<Record<IntervalItemKey, number>>,
              "options",
            );
            setItem(value);
          }}
        >
          {valueOptions.map((value) => (
            <SelectOption key={value} value={value}>
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

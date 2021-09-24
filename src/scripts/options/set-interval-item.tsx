import dayjs from 'dayjs';
import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ControlLabel, LabelWrapper } from '../components/label';
import { Row, RowItem } from '../components/row';
import { useCSS } from '../components/styles';
import '../dayjs-locales';
import { saveToLocalStorage } from '../local-storage';
import { translate } from '../locales';
import { useOptionsContext } from './options-context';
import { Select, SelectOption } from './select';

export type IntervalItemKey = 'syncInterval' | 'updateInterval';

export const SetIntervalItem: FunctionComponent<{
  disabled?: boolean;
  itemKey: IntervalItemKey;
  label: string;
  valueOptions: number[];
}> = ({ disabled = false, itemKey, label, valueOptions }) => {
  const {
    initialItems: { [itemKey]: initialItem },
  } = useOptionsContext();
  const [item, setItem] = useState(initialItem);

  const css = useCSS();
  const rowClass = useMemo(
    () =>
      css({
        '&&': {
          minHeight: '2.5em',
        },
      }),
    [css],
  );

  return (
    <Row class={rowClass}>
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
          onInput={e => {
            const value = Number(e.currentTarget.value);
            void saveToLocalStorage(
              { [itemKey]: value } as Partial<Record<IntervalItemKey, number>>,
              'options',
            );
            setItem(value);
          }}
        >
          {valueOptions.map(value => (
            <SelectOption key={value} value={value}>
              {dayjs.duration({ minutes: value }).locale(translate('lang')).humanize(false)}
            </SelectOption>
          ))}
        </Select>
      </RowItem>
    </Row>
  );
};

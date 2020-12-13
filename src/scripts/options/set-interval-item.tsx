import dayjs from 'dayjs';
import { FunctionComponent, h } from 'preact';
import { useContext, useMemo, useState } from 'preact/hooks';
import { Label, LabelItem } from '../components/label';
import { Row, RowItem } from '../components/row';
import { SectionItem } from '../components/section';
import { useCSS } from '../components/styles';
import '../dayjs-locales';
import * as LocalStorage from '../local-storage';
import { translate } from '../utilities';
import { Context } from './context';
import { Select, SelectOption } from './select';

export const SetIntervalItem: FunctionComponent<{
  itemKey: 'syncInterval' | 'updateInterval';
  label: string;
  valueOptions: number[];
}> = ({ itemKey, label, valueOptions }) => {
  const {
    initialItems: { [itemKey]: initialItem },
  } = useContext(Context);
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
    <SectionItem>
      <Row class={rowClass}>
        <RowItem expanded>
          <Label for={itemKey}>
            <LabelItem primary>{label}</LabelItem>
          </Label>
        </RowItem>
        <RowItem>
          <Select
            id={itemKey}
            value={item}
            onInput={e => {
              const value = Number(e.currentTarget.value);
              void LocalStorage.store({ [itemKey]: value });
              setItem(value);
            }}
          >
            {valueOptions.map(value => (
              <SelectOption key={value} value={value}>
                {dayjs
                  .duration({ minutes: value })
                  .locale(translate('dayjsLocale'))
                  .humanize(false)}
              </SelectOption>
            ))}
          </Select>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

import dayjs from 'dayjs';
import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { Label, LabelWrapper } from '../components/label';
import { Row, RowItem } from '../components/row';
import { SectionItem } from '../components/section';
import { useCSS } from '../components/styles';
import '../dayjs-locales';
import * as LocalStorage from '../local-storage';
import { translate } from '../utilities';
import { useOptionsContext } from './options-context';
import { Select, SelectOption } from './select';

export const SetIntervalItem: FunctionComponent<{
  itemKey: 'syncInterval' | 'updateInterval';
  label: string;
  valueOptions: number[];
}> = ({ itemKey, label, valueOptions }) => {
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
    <SectionItem>
      <Row class={rowClass}>
        <RowItem expanded>
          <LabelWrapper>
            <Label for={itemKey}>{label}</Label>
          </LabelWrapper>
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
                {dayjs.duration({ minutes: value }).locale(translate('lang')).humanize(false)}
              </SelectOption>
            ))}
          </Select>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

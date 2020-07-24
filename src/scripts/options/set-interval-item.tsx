import dayjs from 'dayjs';
import { FunctionComponent, h } from 'preact';
import { useContext, useState } from 'preact/hooks';
import '../dayjs-locales';
import * as LocalStorage from '../local-storage';
import { translate } from '../utilities';
import { Context } from './context';
import { SectionItem } from './section';

export type SetIntervalItemProps = {
  itemKey: 'syncInterval' | 'updateInterval';
  label: string;
  valueOptions: number[];
};

export const SetIntervalItem: FunctionComponent<Readonly<SetIntervalItemProps>> = props => {
  const { [props.itemKey]: initialItem } = useContext(Context).initialItems;
  const [item, setItem] = useState(initialItem);
  return (
    <SectionItem>
      <div class="ub-row field is-grouped">
        <div class="control is-expanded">
          <label for={props.itemKey}>{props.label}</label>
        </div>
        <div class="control">
          <div class="select">
            <select
              id={props.itemKey}
              value={item}
              onInput={e => {
                const value = Number(e.currentTarget.value);
                void LocalStorage.store({ [props.itemKey]: value });
                setItem(value);
              }}
            >
              {props.valueOptions.map(value => (
                <option key={value} value={value}>
                  {dayjs
                    .duration({ minutes: value })
                    .locale(translate('dayjsLocale'))
                    .humanize(false)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </SectionItem>
  );
};

import dayjs from 'dayjs';
import React from 'react';
import { apis } from '../apis';
import '../dayjs-locales';
import * as LocalStorage from '../local-storage';
import { InitialItems } from './initial-items';

export type SetIntervalItemProps = {
  itemKey: 'syncInterval' | 'updateInterval';
  label: string;
  valueOptions: number[];
};

export const SetIntervalItem: React.FC<Readonly<SetIntervalItemProps>> = props => {
  const { [props.itemKey]: initialItem } = React.useContext(InitialItems);
  const [item, setItem] = React.useState(initialItem);
  return (
    <div className="ub-row field is-grouped">
      <div className="control is-expanded">
        <label htmlFor={props.itemKey}>{props.label}</label>
      </div>
      <div className="control">
        <div className="select">
          <select
            id={props.itemKey}
            value={item}
            onChange={e => {
              const value = Number(e.currentTarget.value);
              setItem(value);
              LocalStorage.store({ [props.itemKey]: value });
            }}
          >
            {props.valueOptions.map(value => (
              <option key={value} value={value}>
                {dayjs
                  .duration({ minutes: value })
                  .locale(apis.i18n.getMessage('dayjsLocale'))
                  .humanize(false)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

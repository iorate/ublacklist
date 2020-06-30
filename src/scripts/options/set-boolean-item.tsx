import React from 'react';
import * as LocalStorage from '../local-storage';
import { InitialItems } from './initial-items';

export type SetBooleanItemProps = {
  itemKey: 'skipBlockDialog' | 'hideBlockLinks' | 'hideControl';
  label: string;
};

export const SetBooleanItem: React.FC<Readonly<SetBooleanItemProps>> = props => {
  const { [props.itemKey]: initialItem } = React.useContext(InitialItems);
  const [item, setItem] = React.useState(initialItem);
  return (
    <div className="ub-row field is-grouped">
      <div className="control is-expanded">
        <label htmlFor={props.itemKey}>{props.label}</label>
      </div>
      <div className="control">
        <div className="ub-switch">
          <input
            id={props.itemKey}
            className="switch is-rounded"
            type="checkbox"
            checked={item}
            onChange={e => {
              const value = e.currentTarget.checked;
              setItem(value);
              LocalStorage.store({ [props.itemKey]: value });
            }}
          />
          <label className="label" htmlFor={props.itemKey} />
        </div>
      </div>
    </div>
  );
};

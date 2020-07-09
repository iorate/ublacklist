import { FunctionComponent, h } from 'preact';
import { useContext, useState } from 'preact/hooks';
import * as LocalStorage from '../local-storage';
import { Context } from './context';
import { SectionItem } from './section';

export type SetBooleanItemProps = {
  itemKey: 'skipBlockDialog' | 'hideBlockLinks' | 'hideControl';
  label: string;
};

export const SetBooleanItem: FunctionComponent<Readonly<SetBooleanItemProps>> = props => {
  const { [props.itemKey]: initialItem } = useContext(Context).initialItems;
  const [item, setItem] = useState(initialItem);
  return (
    <SectionItem>
      <div class="ub-row field is-grouped">
        <div class="control is-expanded">
          <label for={props.itemKey}>{props.label}</label>
        </div>
        <div class="control">
          <div class="ub-switch">
            <input
              id={props.itemKey}
              class="switch is-rounded"
              type="checkbox"
              checked={item}
              onInput={e => {
                const value = e.currentTarget.checked;
                LocalStorage.store({ [props.itemKey]: value });
                setItem(value);
              }}
            />
            <label class="label" for={props.itemKey} />
          </div>
        </div>
      </div>
    </SectionItem>
  );
};

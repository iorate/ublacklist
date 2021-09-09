import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ControlLabel, LabelWrapper } from '../components/label';
import { Row, RowItem } from '../components/row';
import { useCSS } from '../components/styles';
import { Switch } from '../components/switch';
import { saveToLocalStorage } from '../local-storage';
import { LocalStorageItems } from '../types';
import { useOptionsContext } from './options-context';

export type BooleanItemKey = keyof {
  [Key in keyof LocalStorageItems as boolean extends LocalStorageItems[Key] ? Key : never]: boolean;
};

export const SetBooleanItem: FunctionComponent<{
  disabled?: boolean;
  itemKey: BooleanItemKey;
  label: string;
}> = ({ disabled = false, itemKey, label }) => {
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
        <Switch
          checked={item}
          disabled={disabled}
          id={itemKey}
          onInput={e => {
            const value = e.currentTarget.checked;
            void saveToLocalStorage(
              { [itemKey]: value } as Partial<Record<BooleanItemKey, boolean>>,
              'options',
            );
            setItem(value);
          }}
        />
      </RowItem>
    </Row>
  );
};

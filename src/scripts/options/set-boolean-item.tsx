import React, { useMemo, useState } from 'react';
import { ControlLabel, LabelWrapper, SubLabel } from '../components/label';
import { Row, RowItem } from '../components/row';
import { useCSS } from '../components/styles';
import { Switch } from '../components/switch';
import { saveToLocalStorage } from '../local-storage';
import { LocalStorageItems } from '../types';
import { useOptionsContext } from './options-context';

export type BooleanItemKey = keyof {
  [Key in keyof LocalStorageItems as boolean extends LocalStorageItems[Key] ? Key : never]: boolean;
};

export const SetBooleanItem: React.VFC<{
  disabled?: boolean;
  itemKey: BooleanItemKey;
  label: string;
  subLabels?: readonly string[];
}> = ({ disabled = false, itemKey, label, subLabels = [] }) => {
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
    <Row className={rowClass}>
      <RowItem expanded>
        <LabelWrapper>
          <ControlLabel for={itemKey}>{label}</ControlLabel>
          {subLabels.map(subLabel => (
            <SubLabel key={subLabel}>{subLabel}</SubLabel>
          ))}
        </LabelWrapper>
      </RowItem>
      <RowItem>
        <Switch
          checked={item}
          disabled={disabled}
          id={itemKey}
          onChange={e => {
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

import { FunctionComponent, h } from 'preact';
import { useContext, useMemo, useState } from 'preact/hooks';
import { Label, LabelItem } from '../components/label';
import { Row, RowItem } from '../components/row';
import { SectionItem } from '../components/section';
import { useCSS } from '../components/styles';
import { Switch } from '../components/switch';
import * as LocalStorage from '../local-storage';
import { Context } from './context';

export const SetBooleanItem: FunctionComponent<{
  itemKey: 'skipBlockDialog' | 'hideBlockLinks' | 'hideControl';
  label: string;
}> = ({ itemKey, label }) => {
  const { [itemKey]: initialItem } = useContext(Context).initialItems;
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
          <Switch
            checked={item}
            id={itemKey}
            onInput={e => {
              const value = e.currentTarget.checked;
              void LocalStorage.store({ [itemKey]: value });
              setItem(value);
            }}
          />
        </RowItem>
      </Row>
    </SectionItem>
  );
};

import removeIconURL from '@mdi/svg/svg/delete.svg';
import addIconURL from '@mdi/svg/svg/plus.svg';
import { FunctionComponent, h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';
import { ColorPicker } from '../components/color-picker';
import { IconButton } from '../components/icon-button';
import { Indent } from '../components/indent';
import { ControlLabel, Label, LabelWrapper, SubLabel } from '../components/label';
import { List, ListItem } from '../components/list';
import { RadioButton } from '../components/radio-button';
import { Row, RowItem } from '../components/row';
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from '../components/section';
import { useCSS } from '../components/styles';
import * as LocalStorage from '../local-storage';
import { translate } from '../utilities';
import { useOptionsContext } from './options-context';

const SetColorItem: FunctionComponent<{
  initialColor: string;
  itemKey: 'linkColor' | 'blockColor';
  label: string;
}> = ({ initialColor, itemKey, label }) => {
  const {
    initialItems: { [itemKey]: initialItem },
  } = useOptionsContext();
  const [specifyColor, setSpecifyColor] = useState(initialItem !== 'default');
  const [color, setColor] = useState(initialItem === 'default' ? initialColor : initialItem);

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{label}</Label>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={!specifyColor}
              id={`${itemKey}UseDefault`}
              name={itemKey}
              onInput={e => {
                if (e.currentTarget.checked) {
                  setSpecifyColor(false);
                  void LocalStorage.store({ [itemKey]: 'default' });
                }
              }}
            ></RadioButton>
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for={`${itemKey}UseDefault`}>
              {translate('options_colorUseDefault')}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={specifyColor}
              id={`${itemKey}Specify`}
              name={itemKey}
              onInput={e => {
                if (e.currentTarget.checked) {
                  setSpecifyColor(true);
                  void LocalStorage.store({ [itemKey]: color });
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for={`${itemKey}Specify`}>
              {translate('options_colorSpecify')}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <ColorPicker
            aria-label={label}
            value={color}
            onInput={e => {
              setSpecifyColor(true);
              const color = e.currentTarget.value;
              setColor(color);
              void LocalStorage.store({ [itemKey]: color });
            }}
          />
        </RowItem>
      </Row>
    </SectionItem>
  );
};

const SetHighlightColors: FunctionComponent = () => {
  const {
    initialItems: { highlightColors: initialHighlightColors },
  } = useOptionsContext();
  const [colorsAndKeys, setColorsAndKeys] = useState(
    initialHighlightColors.map((color, index) => [color, index] as const),
  );
  const nextKey = useRef(initialHighlightColors.length);

  const css = useCSS();
  const spacerClass = useMemo(
    () =>
      css({
        height: '36px',
        width: '36px',
      }),
    [css],
  );

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate('options_highlightColors')}</Label>
            <SubLabel>{translate('options_highlightDescription')}</SubLabel>
            <SubLabel>{translate('options_blacklistExample', '@1*://*.example.com/*')}</SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <IconButton
            aria-label={translate('options_highlightColorAdd')}
            iconURL={addIconURL}
            onClick={() => {
              colorsAndKeys.push(['#ddeeff', nextKey.current++]);
              setColorsAndKeys([...colorsAndKeys]);
              void LocalStorage.store({ highlightColors: colorsAndKeys.map(([color]) => color) });
            }}
          />
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent />
        </RowItem>
        <RowItem expanded>
          <List>
            {colorsAndKeys.map(([color, key], index) => (
              <ListItem key={key}>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper>
                      <Label id={`highlightColor${index}`}>
                        {translate('options_highlightColorNth', String(index + 1))}
                      </Label>
                    </LabelWrapper>
                  </RowItem>
                  <RowItem>
                    <ColorPicker
                      aria-labelledby={`highlightColor${index}`}
                      value={color}
                      onInput={e => {
                        colorsAndKeys[index] = [e.currentTarget.value, colorsAndKeys[index][1]];
                        setColorsAndKeys([...colorsAndKeys]);
                        void LocalStorage.store({
                          highlightColors: colorsAndKeys.map(([color]) => color),
                        });
                      }}
                    />
                  </RowItem>
                  <RowItem>
                    {index === colorsAndKeys.length - 1 ? (
                      <IconButton
                        aria-label={translate('options_highlightColorAdd')}
                        iconURL={removeIconURL}
                        onClick={() => {
                          colorsAndKeys.pop();
                          setColorsAndKeys([...colorsAndKeys]);
                          void LocalStorage.store({
                            highlightColors: colorsAndKeys.map(([color]) => color),
                          });
                        }}
                      />
                    ) : (
                      <div class={spacerClass} />
                    )}
                  </RowItem>
                </Row>
              </ListItem>
            ))}
          </List>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

const SetDialogTheme: FunctionComponent = () => {
  const {
    initialItems: { dialogTheme: initialDialogTheme },
  } = useOptionsContext();
  const [dialogTheme, setDialogTheme] = useState(initialDialogTheme);

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate('options_dialogTheme')}</Label>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={dialogTheme === 'default'}
              id="dialogThemeDefault"
              name="dialogTheme"
              onInput={e => {
                if (e.currentTarget.checked) {
                  setDialogTheme('default');
                  void LocalStorage.store({ dialogTheme: 'default' });
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for="dialogThemeDefault">
              {translate('options_dialogThemeDefault')}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={dialogTheme === 'light'}
              id="dialogThemeLight"
              name="dialogTheme"
              onInput={e => {
                if (e.currentTarget.checked) {
                  setDialogTheme('light');
                  void LocalStorage.store({ dialogTheme: 'light' });
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for="dialogThemeLight">
              {translate('options_dialogThemeLight')}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={dialogTheme === 'dark'}
              id="dialogThemeDark"
              name="dialogTheme"
              onInput={e => {
                if (e.currentTarget.checked) {
                  setDialogTheme('dark');
                  void LocalStorage.store({ dialogTheme: 'dark' });
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for="dialogThemeDark">
              {translate('options_dialogThemeDark')}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

export const AppearanceSection: FunctionComponent = () => (
  <Section aria-labelledby="appearanceSectionTitle" id="appearance">
    <SectionHeader>
      <SectionTitle id="appearanceSectionTitle">
        {translate('options_appearanceTitle')}
      </SectionTitle>
    </SectionHeader>
    <SectionBody>
      <SetColorItem
        initialColor="#1a0dab"
        itemKey="linkColor"
        label={translate('options_linkColor')}
      />
      <SetColorItem
        initialColor="#ffe0e0"
        itemKey="blockColor"
        label={translate('options_blockColor')}
      />
      <SetHighlightColors />
      <SetDialogTheme />
    </SectionBody>
  </Section>
);

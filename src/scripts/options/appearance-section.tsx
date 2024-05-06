import removeIcon from "@mdi/svg/svg/delete.svg";
import addIcon from "@mdi/svg/svg/plus.svg";
import { useRef, useState } from "react";
import { ColorPicker } from "../components/color-picker.tsx";
import { IconButton } from "../components/icon-button.tsx";
import { Indent } from "../components/indent.tsx";
import {
  ControlLabel,
  Label,
  LabelWrapper,
  SubLabel,
} from "../components/label.tsx";
import { List, ListItem } from "../components/list.tsx";
import { RadioButton } from "../components/radio-button.tsx";
import { Row, RowItem } from "../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../components/section.tsx";
import { useClassName } from "../components/utilities.ts";
import { saveToLocalStorage } from "../local-storage.ts";
import { translate } from "../locales.ts";
import { svgToDataURL } from "../utilities.ts";
import { useOptionsContext } from "./options-context.tsx";

type ColorItemKey = "linkColor" | "blockColor";

const SetColorItem: React.FC<{
  initialColor: string;
  itemKey: ColorItemKey;
  label: string;
}> = ({ initialColor, itemKey, label }) => {
  const {
    initialItems: { [itemKey]: initialItem },
  } = useOptionsContext();
  const [specifyColor, setSpecifyColor] = useState(initialItem !== "default");
  const [color, setColor] = useState(
    initialItem === "default" ? initialColor : initialItem,
  );

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
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  setSpecifyColor(false);
                  void saveToLocalStorage(
                    { [itemKey]: "default" } as Partial<
                      Record<ColorItemKey, string>
                    >,
                    "options",
                  );
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for={`${itemKey}UseDefault`}>
              {translate("options_colorUseDefault")}
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
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  setSpecifyColor(true);
                  void saveToLocalStorage(
                    { [itemKey]: color } as Partial<
                      Record<ColorItemKey, string>
                    >,
                    "options",
                  );
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for={`${itemKey}Specify`}>
              {translate("options_colorSpecify")}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <ColorPicker
            aria-label={label}
            value={color}
            onChange={(value) => {
              setSpecifyColor(true);
              setColor(value);
              void saveToLocalStorage(
                { [itemKey]: value } as Partial<Record<ColorItemKey, string>>,
                "options",
              );
            }}
          />
        </RowItem>
      </Row>
    </SectionItem>
  );
};

const SetHighlightColors: React.FC = () => {
  const {
    initialItems: { highlightColors: initialHighlightColors },
  } = useOptionsContext();
  const [colorsAndKeys, setColorsAndKeys] = useState(
    initialHighlightColors.map((color, index) => [color, index] as const),
  );
  const nextKey = useRef(initialHighlightColors.length);

  const spacerClass = useClassName(
    () => ({
      height: "36px",
      width: "36px",
    }),
    [],
  );

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate("options_highlightColors")}</Label>
            <SubLabel>{translate("options_highlightDescription")}</SubLabel>
            <SubLabel>
              {translate("options_blacklistExample", "@1*://*.example.com/*")}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <IconButton
            aria-label={translate("options_highlightColorAdd")}
            iconURL={svgToDataURL(addIcon)}
            onClick={() => {
              colorsAndKeys.push(["#ddeeff", nextKey.current++]);
              setColorsAndKeys([...colorsAndKeys]);
              void saveToLocalStorage(
                { highlightColors: colorsAndKeys.map(([color]) => color) },
                "options",
              );
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
                        {translate(
                          "options_highlightColorNth",
                          String(index + 1),
                        )}
                      </Label>
                    </LabelWrapper>
                  </RowItem>
                  <RowItem>
                    <ColorPicker
                      aria-labelledby={`highlightColor${index}`}
                      value={color}
                      onChange={(value) => {
                        colorsAndKeys[index] = [value, colorsAndKeys[index][1]];
                        setColorsAndKeys([...colorsAndKeys]);
                        void saveToLocalStorage(
                          {
                            highlightColors: colorsAndKeys.map(
                              ([color]) => color,
                            ),
                          },
                          "options",
                        );
                      }}
                    />
                  </RowItem>
                  <RowItem>
                    {index === colorsAndKeys.length - 1 ? (
                      <IconButton
                        aria-label={translate("options_highlightColorAdd")}
                        iconURL={svgToDataURL(removeIcon)}
                        onClick={() => {
                          colorsAndKeys.pop();
                          setColorsAndKeys([...colorsAndKeys]);
                          void saveToLocalStorage(
                            {
                              highlightColors: colorsAndKeys.map(
                                ([color]) => color,
                              ),
                            },
                            "options",
                          );
                        }}
                      />
                    ) : (
                      <div className={spacerClass} />
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

const SetDialogTheme: React.FC = () => {
  const {
    initialItems: { dialogTheme: initialDialogTheme },
  } = useOptionsContext();
  const [dialogTheme, setDialogTheme] = useState(initialDialogTheme);

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate("options_dialogTheme")}</Label>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={dialogTheme === "default"}
              id="dialogThemeDefault"
              name="dialogTheme"
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  setDialogTheme("default");
                  void saveToLocalStorage(
                    { dialogTheme: "default" },
                    "options",
                  );
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for="dialogThemeDefault">
              {translate("options_dialogThemeDefault")}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={dialogTheme === "light"}
              id="dialogThemeLight"
              name="dialogTheme"
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  setDialogTheme("light");
                  void saveToLocalStorage({ dialogTheme: "light" }, "options");
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for="dialogThemeLight">
              {translate("options_dialogThemeLight")}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent>
            <RadioButton
              checked={dialogTheme === "dark"}
              id="dialogThemeDark"
              name="dialogTheme"
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  setDialogTheme("dark");
                  void saveToLocalStorage({ dialogTheme: "dark" }, "options");
                }
              }}
            />
          </Indent>
        </RowItem>
        <RowItem expanded>
          <LabelWrapper>
            <ControlLabel for="dialogThemeDark">
              {translate("options_dialogThemeDark")}
            </ControlLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

export const AppearanceSection: React.FC = () => (
  <Section aria-labelledby="appearanceSectionTitle" id="appearance">
    <SectionHeader>
      <SectionTitle id="appearanceSectionTitle">
        {translate("options_appearanceTitle")}
      </SectionTitle>
    </SectionHeader>
    <SectionBody>
      <SetColorItem
        initialColor="#1a0dab"
        itemKey="linkColor"
        label={translate("options_linkColor")}
      />
      <SetColorItem
        initialColor="#ffe0e0"
        itemKey="blockColor"
        label={translate("options_blockColor")}
      />
      <SetHighlightColors />
      <SetDialogTheme />
    </SectionBody>
  </Section>
);

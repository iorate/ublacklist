import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import removeIcon from "@mdi/svg/svg/delete.svg";
import addIcon from "@mdi/svg/svg/plus.svg";
import clsx from "clsx";
import { useId, useRef, useState } from "react";
import { ColorPicker } from "../components/color-picker.tsx";
import iconButtonStyles from "../components/icon-button.module.css";
import indentStyles from "../components/indent.module.css";
import labelStyles from "../components/label.module.css";
import listStyles from "../components/list.module.css";
import styles from "../components/radio.module.css";
import rowStyles from "../components/row.module.css";
import sectionStyles from "../components/section.module.css";
import { SvgIcon } from "../components/svg-icon.tsx";
import {
  defaultBlockColor,
  defaultHighlightColor,
} from "../shared/constants.ts";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { storageStore } from "../shared/storage-store.ts";
import localStyles from "./appearance-section.module.css";

type ColorItemKey = "linkColor" | "blockColor";

const SetColorItem: React.FC<{
  initialColor: string;
  itemKey: ColorItemKey;
  label: string;
}> = ({ initialColor, itemKey, label }) => {
  const [specifyColor, setSpecifyColor] = useState(
    () => storageStore.get()[itemKey] !== "default",
  );
  const [color, setColor] = useState(() => {
    const initialItem = storageStore.get()[itemKey];
    return initialItem === "default" ? initialColor : initialItem;
  });

  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>{label}</div>
          </div>
        </div>
      </div>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <RadioGroup
            value={specifyColor ? "specify" : "default"}
            onValueChange={(value) => {
              const specify = value === "specify";
              setSpecifyColor(specify);
              void saveToLocalStorage(
                { [itemKey]: specify ? color : "default" } as Partial<
                  Record<ColorItemKey, string>
                >,
                "options",
              );
            }}
          >
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <div className={indentStyles.indent}>
                  <Radio.Root
                    className={styles.radio}
                    id={`${itemKey}UseDefault`}
                    value="default"
                  >
                    <Radio.Indicator className={styles.indicator} />
                  </Radio.Root>
                </div>
              </div>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div className={labelStyles.wrapper}>
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${itemKey}UseDefault`}
                  >
                    {translate("options_colorUseDefault")}
                  </label>
                </div>
              </div>
            </div>
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <div className={indentStyles.indent}>
                  <Radio.Root
                    className={styles.radio}
                    id={`${itemKey}Specify`}
                    value="specify"
                  >
                    <Radio.Indicator className={styles.indicator} />
                  </Radio.Root>
                </div>
              </div>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div className={labelStyles.wrapper}>
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${itemKey}Specify`}
                  >
                    {translate("options_colorSpecify")}
                  </label>
                </div>
              </div>
              <div className={rowStyles.rowItem}>
                <ColorPicker
                  aria-label={label}
                  value={color}
                  onChange={(value) => {
                    setSpecifyColor(true);
                    setColor(value);
                    void saveToLocalStorage(
                      { [itemKey]: value } as Partial<
                        Record<ColorItemKey, string>
                      >,
                      "options",
                    );
                  }}
                />
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

const SetHighlightColors: React.FC = () => {
  const [colorsAndKeys, setColorsAndKeys] = useState(() =>
    storageStore
      .get()
      .highlightColors.map((color, index) => [color, index] as const),
  );
  const nextKey = useRef(colorsAndKeys.length);

  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_highlightColors")}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_highlightDescription")}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_blacklistExample", "@1*://*.example.com/*")}
            </div>
          </div>
        </div>
        <div className={rowStyles.rowItem}>
          <button
            className={iconButtonStyles.button}
            type="button"
            aria-label={translate("options_highlightColorAdd")}
            onClick={() => {
              colorsAndKeys.push([defaultHighlightColor, nextKey.current++]);
              setColorsAndKeys([...colorsAndKeys]);
              void saveToLocalStorage(
                { highlightColors: colorsAndKeys.map(([color]) => color) },
                "options",
              );
            }}
          >
            <SvgIcon color="var(--ub-color-text-secondary)" svg={addIcon} />
          </button>
        </div>
      </div>
      <div className={rowStyles.row}>
        <div className={rowStyles.rowItem}>
          <div className={indentStyles.indent} />
        </div>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <ul className={listStyles.list}>
            {colorsAndKeys.map(([color, key], index) => (
              <li className={listStyles.item} key={key}>
                <div className={rowStyles.row}>
                  <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                    <div className={labelStyles.wrapper}>
                      <div
                        className={labelStyles.label}
                        id={`highlightColor${index}`}
                      >
                        {translate(
                          "options_highlightColorNth",
                          String(index + 1),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={rowStyles.rowItem}>
                    <ColorPicker
                      aria-labelledby={`highlightColor${index}`}
                      value={color}
                      onChange={(value) => {
                        colorsAndKeys[index] = [
                          value,
                          // biome-ignore lint/style/noNonNullAssertion: `colorsAndKeys` always has a value at `index`.
                          colorsAndKeys[index]![1],
                        ];
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
                  </div>
                  <div className={rowStyles.rowItem}>
                    {index === colorsAndKeys.length - 1 ? (
                      <button
                        className={iconButtonStyles.button}
                        type="button"
                        aria-label={translate("options_highlightColorRemove")}
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
                      >
                        <SvgIcon
                          color="var(--ub-color-text-secondary)"
                          svg={removeIcon}
                        />
                      </button>
                    ) : (
                      <div className={localStyles.spacer} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const SetDialogTheme: React.FC = () => {
  const id = useId();
  const dialogTheme = storageStore.use.dialogTheme();

  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_dialogTheme")}
            </div>
          </div>
        </div>
      </div>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <RadioGroup
            value={dialogTheme}
            onValueChange={(value: "default" | "light" | "dark") => {
              void saveToLocalStorage({ dialogTheme: value }, "options");
            }}
          >
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <div className={indentStyles.indent}>
                  <Radio.Root
                    className={styles.radio}
                    id={`${id}-default`}
                    value="default"
                  >
                    <Radio.Indicator className={styles.indicator} />
                  </Radio.Root>
                </div>
              </div>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div className={labelStyles.wrapper}>
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${id}-default`}
                  >
                    {translate("options_dialogThemeDefault")}
                  </label>
                </div>
              </div>
            </div>
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <div className={indentStyles.indent}>
                  <Radio.Root
                    className={styles.radio}
                    id={`${id}-light`}
                    value="light"
                  >
                    <Radio.Indicator className={styles.indicator} />
                  </Radio.Root>
                </div>
              </div>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div className={labelStyles.wrapper}>
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${id}-light`}
                  >
                    {translate("options_dialogThemeLight")}
                  </label>
                </div>
              </div>
            </div>
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <div className={indentStyles.indent}>
                  <Radio.Root
                    className={styles.radio}
                    id={`${id}-dark`}
                    value="dark"
                  >
                    <Radio.Indicator className={styles.indicator} />
                  </Radio.Root>
                </div>
              </div>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div className={labelStyles.wrapper}>
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${id}-dark`}
                  >
                    {translate("options_dialogThemeDark")}
                  </label>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export const AppearanceSection: React.FC<{ id: string }> = (props) => {
  const id = useId();
  return (
    <section
      className={sectionStyles.section}
      aria-labelledby={`${id}-title`}
      id={props.id}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_appearanceTitle")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <SetColorItem
          initialColor={defaultBlockColor}
          itemKey="blockColor"
          label={translate("options_blockColor")}
        />
        <SetHighlightColors />
        <SetDialogTheme />
      </div>
    </section>
  );
};

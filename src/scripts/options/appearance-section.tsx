import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import removeIcon from "@mdi/svg/svg/delete.svg";
import addIcon from "@mdi/svg/svg/plus.svg";
import clsx from "clsx";
import { isEqual } from "es-toolkit";
import { useId, useRef, useState } from "react";
import { ColorPicker } from "../components/color-picker.tsx";
import { SvgIcon } from "../components/svg-icon.tsx";
import {
  defaultBlockColor,
  defaultHighlightColor,
} from "../shared/constants.ts";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { storageStore } from "../shared/storage-store.ts";
import iconButtonStyles from "../styles/icon-button.module.css";
import indentStyles from "../styles/indent.module.css";
import labelStyles from "../styles/label.module.css";
import listStyles from "../styles/list.module.css";
import styles from "../styles/radio.module.css";
import rowStyles from "../styles/row.module.css";
import sectionStyles from "../styles/section.module.css";
import localStyles from "./appearance-section.module.css";
import { saveSource } from "./shared/save-source.ts";

function SetBlockColor() {
  const id = useId();
  const stored = storageStore.use.blockColor();
  const [draft, setDraft] = useState(stored);
  const pending = useRef(false);
  if (pending.current) {
    if (stored === draft) {
      pending.current = false;
    }
  } else if (stored !== draft) {
    setDraft(stored);
  }

  const save = (value: string) => {
    pending.current = true;
    setDraft(value);
    void saveToLocalStorage({ blockColor: value }, saveSource);
  };

  const color = draft === "default" ? defaultBlockColor : draft;

  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_blockColor")}
            </div>
          </div>
        </div>
      </div>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <RadioGroup
            value={draft === "default" ? "default" : "specify"}
            onValueChange={(value) => {
              save(value === "specify" ? color : "default");
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
                    id={`${id}-specify`}
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
                    htmlFor={`${id}-specify`}
                  >
                    {translate("options_colorSpecify")}
                  </label>
                </div>
              </div>
              <div className={rowStyles.rowItem}>
                <ColorPicker
                  aria-label={translate("options_blockColor")}
                  value={color}
                  onValueChange={save}
                />
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

function SetHighlightColors() {
  const id = useId();
  const storedColors = storageStore.use.highlightColors();
  const [draft, setDraft] = useState(() =>
    storedColors.map((color, index) => ({ color, key: index })),
  );
  const nextKey = useRef(storedColors.length);
  const pending = useRef(false);
  const draftColors = draft.map((item) => item.color);
  if (pending.current) {
    if (isEqual(storedColors, draftColors)) {
      pending.current = false;
    }
  } else if (!isEqual(storedColors, draftColors)) {
    setDraft(storedColors.map((color) => ({ color, key: nextKey.current++ })));
  }

  const save = (next: { color: string; key: number }[]) => {
    pending.current = true;
    setDraft(next);
    void saveToLocalStorage(
      { highlightColors: next.map((item) => item.color) },
      saveSource,
    );
  };

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
              save([
                ...draft,
                { color: defaultHighlightColor, key: nextKey.current++ },
              ]);
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
            {draft.map(({ color, key }, index) => (
              <li className={listStyles.item} key={key}>
                <div className={rowStyles.row}>
                  <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                    <div className={labelStyles.wrapper}>
                      <div className={labelStyles.label} id={`${id}-${index}`}>
                        {translate(
                          "options_highlightColorNth",
                          String(index + 1),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={rowStyles.rowItem}>
                    <ColorPicker
                      aria-labelledby={`${id}-${index}`}
                      value={color}
                      onValueChange={(value) => {
                        save(
                          draft.map((item, i) =>
                            i === index ? { ...item, color: value } : item,
                          ),
                        );
                      }}
                    />
                  </div>
                  <div className={rowStyles.rowItem}>
                    {index === draft.length - 1 ? (
                      <button
                        className={iconButtonStyles.button}
                        type="button"
                        aria-label={translate("options_highlightColorRemove")}
                        onClick={() => {
                          save(draft.slice(0, -1));
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
}

function SetDialogTheme() {
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
              void saveToLocalStorage({ dialogTheme: value }, saveSource);
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
}

export function AppearanceSection(props: { id: string }) {
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
        <SetBlockColor />
        <SetHighlightColors />
        <SetDialogTheme />
      </div>
    </section>
  );
}

import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import openInNewSVG from "@mdi/svg/svg/open-in-new.svg";
import clsx from "clsx";
import { useEffect, useId, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog.tsx";
import { expandLinks } from "../components/link.tsx";
import { Select, SelectOption } from "../components/select.tsx";
import { SvgIcon } from "../components/svg-icon.tsx";
import { browser } from "../shared/browser.ts";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { addMessageListeners } from "../shared/messages.ts";
import { storageStore } from "../shared/storage-store.ts";
import {
  downloadTextFile,
  lines,
  uploadTextFile,
} from "../shared/utilities.ts";
import buttonStyles from "../styles/button.module.css";
import styles from "../styles/checkbox.module.css";
import iconButtonStyles from "../styles/icon-button.module.css";
import indentStyles from "../styles/indent.module.css";
import labelStyles from "../styles/label.module.css";
import rowStyles from "../styles/row.module.css";
import sectionStyles from "../styles/section.module.css";
import textStyles from "../styles/text.module.css";
import textareaStyles from "../styles/textarea.module.css";
import { RulesetEditor } from "./shared/ruleset-editor.tsx";
import { saveSource } from "./shared/save-source.ts";
import { SetBooleanItem } from "./shared/set-boolean-item.tsx";

function ImportBlacklistForm({
  close,
  setBlacklist,
  setBlacklistDirty,
}: {
  close: () => void;
  setBlacklist: React.Dispatch<React.SetStateAction<string>>;
  setBlacklistDirty: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const id = useId();
  const [source, setSource] = useState<"file" | "pb">("file");
  const [pb, setPB] = useState("");
  const [append, setAppend] = useState(false);
  const replaceOrAppend = (newBlacklist: string) => {
    if (append) {
      setBlacklist(
        (oldBlacklist) =>
          `${oldBlacklist}${
            oldBlacklist && newBlacklist ? "\n" : ""
          }${newBlacklist}`,
      );
    } else {
      setBlacklist(() => newBlacklist);
    }
    setBlacklistDirty(true);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {translate("options_importBlacklistDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className={rowStyles.row}>
          <div className={rowStyles.rowItem}>
            <Select
              value={source}
              onValueChange={(value) => {
                setSource(value as "file" | "pb");
              }}
            >
              <SelectOption value="file">
                {translate("options_importBlacklistDialog_fromFile")}
              </SelectOption>
              <SelectOption value="pb">
                {translate("options_importBlacklistDialog_fromPB")}
              </SelectOption>
            </Select>
          </div>
        </div>
        {source === "pb" && (
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
                <div className={labelStyles.subLabel}>
                  {translate("options_importBlacklistDialog_helper")}
                </div>
                <div className={labelStyles.subLabel}>
                  {translate("options_blacklistExample", "example.com")}
                </div>
              </div>
              <textarea
                aria-label={translate("options_importBlacklistDialog_pbLabel")}
                className={textareaStyles.textArea}
                rows={5}
                style={{ height: "calc(1.5em * 5 + 1em + 2px)" }}
                spellCheck="false"
                value={pb}
                wrap="off"
                onChange={(e) => {
                  setPB(e.currentTarget.value);
                }}
              />
            </div>
          </div>
        )}
        <div className={rowStyles.row}>
          <div className={rowStyles.rowItem}>
            <div className={indentStyles.indent}>
              <Checkbox.Root
                checked={append}
                className={styles.checkbox}
                id={`${id}-append`}
                onCheckedChange={setAppend}
              >
                <Checkbox.Indicator className={styles.indicator} />
              </Checkbox.Root>
            </div>
          </div>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={labelStyles.wrapper}>
              <label
                className={labelStyles.controlLabel}
                htmlFor={`${id}-append`}
              >
                {translate("options_importBlacklistDialog_append")}
              </label>
            </div>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className={clsx(rowStyles.row, rowStyles.right)}>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.secondary)}
              onClick={close}
            >
              {translate("cancelButton")}
            </Button>
          </div>
          <div className={rowStyles.rowItem}>
            {source === "file" ? (
              <Button
                className={clsx(buttonStyles.button, buttonStyles.primary)}
                onClick={async () => {
                  const text = await uploadTextFile("text/plain");
                  if (text == null) {
                    return;
                  }
                  replaceOrAppend(text);
                  close();
                }}
              >
                {translate("options_importBlacklistDialog_selectFile")}
              </Button>
            ) : (
              <Button
                className={clsx(buttonStyles.button, buttonStyles.primary)}
                disabled={!pb}
                onClick={() => {
                  let newBlacklist = "";
                  for (const domain of lines(pb)) {
                    if (/^([A-Za-z0-9-]+\.)*[A-Za-z0-9-]+$/.test(domain)) {
                      newBlacklist = `${newBlacklist}${
                        newBlacklist ? "\n" : ""
                      }*://*.${domain}/*`;
                    }
                  }
                  replaceOrAppend(newBlacklist);
                  close();
                }}
              >
                {translate("options_importBlacklistDialog_importButton")}
              </Button>
            )}
          </div>
        </div>
      </DialogFooter>
    </>
  );
}

function ImportBlacklistDialog({
  close,
  open,
  setBlacklist,
  setBlacklistDirty,
}: {
  close: () => void;
  open: boolean;
  setBlacklist: React.Dispatch<React.SetStateAction<string>>;
  setBlacklistDirty: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog close={close} open={open}>
      <ImportBlacklistForm
        close={close}
        setBlacklist={setBlacklist}
        setBlacklistDirty={setBlacklistDirty}
      />
    </Dialog>
  );
}

function SetBlacklist() {
  const [blacklist, setBlacklist] = useState(
    () => storageStore.get().blacklist,
  );
  const [blacklistDirty, setBlacklistDirty] = useState(false);
  const [latestBlacklist, setLatestBlacklist] = useState<string | null>(null);
  const [importBlacklistDialogOpen, setImportBlacklistDialogOpen] =
    useState(false);
  useEffect(
    () =>
      addMessageListeners({
        "blocklist-saved": (latestBlacklist, source) => {
          if (source !== saveSource) {
            setLatestBlacklist(latestBlacklist);
          }
        },
      }),
    [],
  );
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
            <div className={labelStyles.label}>
              {translate("options_blacklistLabel")}
            </div>
            <div className={labelStyles.subLabel}>
              {expandLinks(translate("options_blacklistHelper"))}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_blockByTitle")}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_blacklistExample", "*://*.example.com/*")}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_blacklistExample", "/example\\.(net|org)/")}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_blacklistExample", "title/Example Domain/")}
            </div>
          </div>
          <RulesetEditor
            height="calc(21em + 10px)"
            resizable
            value={blacklist}
            onChange={(value) => {
              setBlacklist(value);
              setBlacklistDirty(true);
            }}
          />
        </div>
      </div>
      <div
        className={clsx(rowStyles.row, rowStyles.multiline, rowStyles.right)}
      >
        {latestBlacklist != null && (
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <span className={textStyles.secondary}>
              {translate("options_blacklistUpdated")}{" "}
              <Button
                className={buttonStyles.linkButton}
                onClick={() => {
                  setBlacklist(latestBlacklist);
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
              >
                {translate("options_reloadBlacklistButton")}
              </Button>
            </span>
          </div>
        )}
        <div className={rowStyles.rowItem}>
          <div className={rowStyles.row}>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.secondary)}
                onClick={() => {
                  setImportBlacklistDialogOpen(true);
                }}
              >
                {translate("options_importBlacklistButton")}
              </Button>
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.secondary)}
                onClick={() => {
                  downloadTextFile(
                    "uBlacklist.txt",
                    "text/plain;charset=UTF-8",
                    blacklist,
                  );
                }}
              >
                {translate("options_exportBlacklistButton")}
              </Button>
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.primary)}
                data-testid="save-blacklist-button"
                disabled={!blacklistDirty}
                onClick={() => {
                  void saveToLocalStorage({ blacklist }, saveSource);
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
              >
                {translate("options_saveBlacklistButton")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ImportBlacklistDialog
        close={() => setImportBlacklistDialogOpen(false)}
        open={importBlacklistDialogOpen}
        setBlacklist={setBlacklist}
        setBlacklistDirty={setBlacklistDirty}
      />
    </div>
  );
}

function RegisterSearchEngines() {
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_otherSearchEngines")}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_otherSearchEnginesDescription")}
            </div>
          </div>
        </div>
        <div className={rowStyles.rowItem}>
          <button
            className={iconButtonStyles.button}
            type="button"
            aria-label={translate("options_openSerpInfoOptionsButton")}
            onClick={() => {
              browser.tabs.create({
                url: "/pages/serpinfo-options.html",
              });
            }}
          >
            <SvgIcon
              color="var(--ub-color-text-secondary)"
              svg={openInNewSVG}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GeneralSection(props: { id: string }) {
  const id = useId();
  return (
    <section
      className={sectionStyles.section}
      aria-labelledby={`${id}-title`}
      id={props.id}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_generalTitle")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <SetBlacklist />
        <RegisterSearchEngines />
        <div className={sectionStyles.item}>
          <SetBooleanItem
            itemKey="blockWholeSite"
            label={translate("options_blockWholeSiteLabel")}
            subLabels={[translate("options_blockWholeSiteDescription")]}
          />
        </div>
        <div className={sectionStyles.item}>
          <SetBooleanItem
            itemKey="enableMatchingRules"
            label={translate("options_enableMatchingRules")}
          />
        </div>
        <div className={sectionStyles.item}>
          <SetBooleanItem
            itemKey="skipBlockDialog"
            label={translate("options_skipBlockDialogLabel")}
            subLabels={[translate("options_skipBlockDialogDescription")]}
          />
        </div>
        <div className={sectionStyles.item}>
          <SetBooleanItem
            itemKey="hideBlockLinks"
            label={translate("options_hideBlockButtonsLabel")}
          />
        </div>
        <div className={sectionStyles.item}>
          <SetBooleanItem
            itemKey="hideControl"
            label={translate("options_hideControlLabel")}
          />
        </div>
      </div>
    </section>
  );
}

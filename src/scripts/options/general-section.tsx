import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import openInNewSVG from "@mdi/svg/svg/open-in-new.svg";
import clsx from "clsx";
import { useEffect, useId, useState } from "react";
import buttonStyles from "../components/button.module.css";
import styles from "../components/checkbox.module.css";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog.tsx";
import { TemplateIcon } from "../components/icon.tsx";
import iconButtonStyles from "../components/icon-button.module.css";
import indentStyles from "../components/indent.module.css";
import {
  ControlLabel,
  Label,
  LabelWrapper,
  SubLabel,
} from "../components/label.tsx";
import { expandLinks } from "../components/link.tsx";
import rowStyles from "../components/row.module.css";
import sectionStyles from "../components/section.module.css";
import { Select, SelectOption } from "../components/select.tsx";
import textStyles from "../components/text.module.css";
import textareaStyles from "../components/textarea.module.css";
import { browser } from "../shared/browser.ts";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { addMessageListeners } from "../shared/messages.ts";
import { storageStore } from "../shared/storage-store.ts";
import {
  downloadTextFile,
  lines,
  svgToDataURL,
  uploadTextFile,
} from "../shared/utilities.ts";
import { RulesetEditor } from "./ruleset-editor.tsx";
import { SetBooleanItem } from "./set-boolean-item.tsx";

const ImportBlacklistForm: React.FC<{
  close: () => void;
  setBlacklist: React.Dispatch<React.SetStateAction<string>>;
  setBlacklistDirty: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ close, setBlacklist, setBlacklistDirty }) => {
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
              <LabelWrapper fullWidth>
                <SubLabel>
                  {translate("options_importBlacklistDialog_helper")}
                </SubLabel>
                <SubLabel>
                  {translate("options_blacklistExample", "example.com")}
                </SubLabel>
              </LabelWrapper>
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
            <LabelWrapper>
              <ControlLabel for={`${id}-append`}>
                {translate("options_importBlacklistDialog_append")}
              </ControlLabel>
            </LabelWrapper>
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
};

const ImportBlacklistDialog: React.FC<{
  close: () => void;
  open: boolean;
  setBlacklist: React.Dispatch<React.SetStateAction<string>>;
  setBlacklistDirty: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ close, open, setBlacklist, setBlacklistDirty }) => (
  <Dialog close={close} open={open}>
    <ImportBlacklistForm
      close={close}
      setBlacklist={setBlacklist}
      setBlacklistDirty={setBlacklistDirty}
    />
  </Dialog>
);

const SetBlacklist: React.FC = () => {
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
          if (source !== "options") {
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
          <LabelWrapper fullWidth>
            <Label>{translate("options_blacklistLabel")}</Label>
            <SubLabel>
              {expandLinks(translate("options_blacklistHelper"))}
            </SubLabel>
            <SubLabel>{translate("options_blockByTitle")}</SubLabel>
            <SubLabel>
              {translate("options_blacklistExample", "*://*.example.com/*")}
            </SubLabel>
            <SubLabel>
              {translate("options_blacklistExample", "/example\\.(net|org)/")}
            </SubLabel>
            <SubLabel>
              {translate("options_blacklistExample", "title/Example Domain/")}
            </SubLabel>
          </LabelWrapper>
          <RulesetEditor
            height="300px"
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
                  void saveToLocalStorage({ blacklist }, "options");
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
};

const RegisterSearchEngines: React.FC = () => {
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <LabelWrapper>
            <Label>{translate("options_otherSearchEngines")}</Label>
            <SubLabel>
              {translate("options_otherSearchEnginesDescription")}
            </SubLabel>
          </LabelWrapper>
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
            <TemplateIcon
              color="var(--ub-color-text-secondary)"
              iconSize="24px"
              url={svgToDataURL(openInNewSVG)}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export const GeneralSection: React.FC<{ id: string }> = (props) => {
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
};

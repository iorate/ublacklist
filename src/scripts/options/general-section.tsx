import { useEffect, useState } from "react";
import { browser } from "../browser.ts";
import { Button, LinkButton } from "../components/button.tsx";
import { CheckBox } from "../components/checkbox.tsx";
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from "../components/constants.ts";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  type DialogProps,
  DialogTitle,
} from "../components/dialog.tsx";
import { Indent } from "../components/indent.tsx";
import {
  ControlLabel,
  Label,
  LabelWrapper,
  SubLabel,
} from "../components/label.tsx";
import { expandLinks } from "../components/link.tsx";
import { Portal } from "../components/portal.tsx";
import { Row, RowItem } from "../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../components/section.tsx";
import { Text } from "../components/text.tsx";
import { TextArea } from "../components/textarea.tsx";
import { usePrevious } from "../components/utilities.ts";
import { saveToLocalStorage } from "../local-storage.ts";
import { translate } from "../locales.ts";
import { addMessageListeners } from "../messages.ts";
import { downloadTextFile, lines, uploadTextFile } from "../utilities.ts";
import { useOptionsContext } from "./options-context.tsx";
import { RulesetEditor } from "./ruleset-editor.tsx";
import { Select, SelectOption } from "./select.tsx";
import { SetBooleanItem } from "./set-boolean-item.tsx";

const ImportBlacklistDialog: React.FC<
  {
    setBlacklist: React.Dispatch<React.SetStateAction<string>>;
    setBlacklistDirty: React.Dispatch<React.SetStateAction<boolean>>;
  } & DialogProps
> = ({ close, open, setBlacklist, setBlacklistDirty }) => {
  const [state, setState] = useState({
    source: "file" as "file" | "pb",
    pb: "",
    append: false,
  });
  const prevOpen = usePrevious(open);
  if (open && !prevOpen) {
    state.source = "file";
    state.pb = "";
    state.append = false;
  }
  const replaceOrAppend = (newBlacklist: string) => {
    if (state.append) {
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
    <Dialog
      aria-labelledby="importBlacklistDialogTitle"
      close={close}
      open={open}
    >
      <DialogHeader>
        <DialogTitle id="importBlacklistDialogTitle">
          {translate("options_importBlacklistDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem>
            <Select
              className={FOCUS_START_CLASS}
              value={state.source}
              onChange={(e) => {
                const { value } = e.currentTarget;
                setState((s) => ({
                  ...s,
                  source: value as "file" | "pb",
                }));
              }}
            >
              <SelectOption value="file">
                {translate("options_importBlacklistDialog_fromFile")}
              </SelectOption>
              <SelectOption value="pb">
                {translate("options_importBlacklistDialog_fromPB")}
              </SelectOption>
            </Select>
          </RowItem>
        </Row>
        {state.source === "pb" && (
          <Row>
            <RowItem expanded>
              <LabelWrapper fullWidth>
                <SubLabel>
                  {translate("options_importBlacklistDialog_helper")}
                </SubLabel>
                <SubLabel>
                  {translate("options_blacklistExample", "example.com")}
                </SubLabel>
              </LabelWrapper>
              <TextArea
                aria-label={translate("options_importBlacklistDialog_pbLabel")}
                rows={5}
                spellCheck="false"
                value={state.pb}
                wrap="off"
                onChange={(e) => {
                  const { value } = e.currentTarget;
                  setState((s) => ({ ...s, pb: value }));
                }}
              />
            </RowItem>
          </Row>
        )}
        <Row>
          <RowItem>
            <Indent>
              <CheckBox
                checked={state.append}
                id="append"
                onChange={(e) => {
                  const { checked } = e.currentTarget;
                  setState((s) => ({ ...s, append: checked }));
                }}
              />
            </Indent>
          </RowItem>
          <RowItem expanded>
            <LabelWrapper>
              <ControlLabel for="append">
                {translate("options_importBlacklistDialog_append")}
              </ControlLabel>
            </LabelWrapper>
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button
              className={
                state.source === "pb" && !state.pb ? FOCUS_END_CLASS : ""
              }
              onClick={close}
            >
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            {state.source === "file" ? (
              <Button
                className={FOCUS_END_CLASS}
                primary
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
                className={state.pb ? FOCUS_END_CLASS : ""}
                disabled={!state.pb}
                primary
                onClick={() => {
                  let newBlacklist = "";
                  for (const domain of lines(state.pb)) {
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
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const SetBlacklist: React.FC = () => {
  const {
    initialItems: { blacklist: initialBlacklist },
  } = useOptionsContext();
  const [blacklist, setBlacklist] = useState(initialBlacklist);
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
    <SectionItem>
      <Row>
        <RowItem expanded>
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
        </RowItem>
      </Row>
      <Row multiline right>
        {latestBlacklist != null && (
          <RowItem expanded>
            <Text>
              {translate("options_blacklistUpdated")}{" "}
              <LinkButton
                onClick={() => {
                  setBlacklist(latestBlacklist);
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
              >
                {translate("options_reloadBlacklistButton")}
              </LinkButton>
            </Text>
          </RowItem>
        )}
        <RowItem>
          <Row>
            <RowItem>
              <Button
                onClick={() => {
                  setImportBlacklistDialogOpen(true);
                }}
              >
                {translate("options_importBlacklistButton")}
              </Button>
            </RowItem>
            <RowItem>
              <Button
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
            </RowItem>
            <RowItem>
              <Button
                disabled={!blacklistDirty}
                primary
                onClick={() => {
                  void saveToLocalStorage({ blacklist }, "options");
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
              >
                {translate("options_saveBlacklistButton")}
              </Button>
            </RowItem>
          </Row>
        </RowItem>
      </Row>
      <Portal id="importBlacklistDialogPortal">
        <ImportBlacklistDialog
          close={() => setImportBlacklistDialogOpen(false)}
          open={importBlacklistDialogOpen}
          setBlacklist={setBlacklist}
          setBlacklistDirty={setBlacklistDirty}
        />
      </Portal>
    </SectionItem>
  );
};

const RegisterSearchEngines: React.FC = () => {
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate("options_serpInfoLabel")}</Label>
            <SubLabel>
              {translate("options_otherSearchEnginesDescription")}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <Button
            primary
            onClick={() => {
              browser.tabs.create({
                url: "/pages/serpinfo/options.html",
              });
            }}
          >
            {translate("options_openSerpInfoOptionsButton")}
          </Button>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

export const GeneralSection: React.FC = () => (
  <Section aria-labelledby="generalSectionTitle" id="general">
    <SectionHeader>
      <SectionTitle id="generalSectionTitle">
        {translate("options_generalTitle")}
      </SectionTitle>
    </SectionHeader>
    <SectionBody>
      <SetBlacklist />
      <RegisterSearchEngines />
      <SectionItem>
        <SetBooleanItem
          itemKey="blockWholeSite"
          label={translate("options_blockWholeSiteLabel")}
          subLabels={[translate("options_blockWholeSiteDescription")]}
        />
      </SectionItem>
      <SectionItem>
        <SetBooleanItem
          itemKey="enableMatchingRules"
          label={translate("options_enableMatchingRules")}
        />
      </SectionItem>
      <SectionItem>
        <SetBooleanItem
          itemKey="skipBlockDialog"
          label={translate("options_skipBlockDialogLabel")}
        />
      </SectionItem>
      <SectionItem>
        <SetBooleanItem
          itemKey="hideBlockLinks"
          label={translate("options_hideBlockLinksLabel")}
        />
      </SectionItem>
      <SectionItem>
        <SetBooleanItem
          itemKey="hideControl"
          label={translate("options_hideControlLabel")}
        />
      </SectionItem>
    </SectionBody>
  </Section>
);

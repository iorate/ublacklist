import { Checkbox } from "@base-ui/react/checkbox";
import openInNewSVG from "@mdi/svg/svg/open-in-new.svg";
import { useEffect, useId, useState } from "react";
import { Button, LinkButton } from "../components/button.tsx";
import styles from "../components/checkbox.module.css";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog.tsx";
import { IconButton } from "../components/icon-button.tsx";
import { Indent } from "../components/indent.tsx";
import {
  ControlLabel,
  Label,
  LabelWrapper,
  SubLabel,
} from "../components/label.tsx";
import { expandLinks } from "../components/link.tsx";
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
import { Select, SelectOption } from "./select.tsx";
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
        <Row>
          <RowItem>
            <Select
              value={source}
              onChange={(e) => {
                setSource(e.currentTarget.value as "file" | "pb");
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
        {source === "pb" && (
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
                value={pb}
                wrap="off"
                onChange={(e) => {
                  setPB(e.currentTarget.value);
                }}
              />
            </RowItem>
          </Row>
        )}
        <Row>
          <RowItem>
            <Indent>
              <Checkbox.Root
                checked={append}
                className={styles.checkbox}
                id={`${id}-append`}
                onCheckedChange={setAppend}
              >
                <Checkbox.Indicator className={styles.indicator} />
              </Checkbox.Root>
            </Indent>
          </RowItem>
          <RowItem expanded>
            <LabelWrapper>
              <ControlLabel for={`${id}-append`}>
                {translate("options_importBlacklistDialog_append")}
              </ControlLabel>
            </LabelWrapper>
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button onClick={close}>{translate("cancelButton")}</Button>
          </RowItem>
          <RowItem>
            {source === "file" ? (
              <Button
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
                disabled={!pb}
                primary
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
          </RowItem>
        </Row>
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
                data-testid="save-blacklist-button"
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
      <ImportBlacklistDialog
        close={() => setImportBlacklistDialogOpen(false)}
        open={importBlacklistDialogOpen}
        setBlacklist={setBlacklist}
        setBlacklistDirty={setBlacklistDirty}
      />
    </SectionItem>
  );
};

const RegisterSearchEngines: React.FC = () => {
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate("options_otherSearchEngines")}</Label>
            <SubLabel>
              {translate("options_otherSearchEnginesDescription")}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <IconButton
            aria-label={translate("options_openSerpInfoOptionsButton")}
            iconURL={svgToDataURL(openInNewSVG)}
            onClick={() => {
              browser.tabs.create({
                url: "/pages/serpinfo-options.html",
              });
            }}
          />
        </RowItem>
      </Row>
    </SectionItem>
  );
};

export const GeneralSection: React.FC<{ id: string }> = (props) => {
  const id = useId();
  return (
    <Section aria-labelledby={`${id}-title`} id={props.id}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
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
            subLabels={[translate("options_skipBlockDialogDescription")]}
          />
        </SectionItem>
        <SectionItem>
          <SetBooleanItem
            itemKey="hideBlockLinks"
            label={translate("options_hideBlockButtonsLabel")}
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
};

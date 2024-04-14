import { useState } from "react";
import { z } from "zod";
import { browser } from "../browser.ts";
import { Button } from "../components/button.tsx";
import { Label, LabelWrapper, SubLabel } from "../components/label.tsx";
import { Row, RowItem } from "../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../components/section.tsx";
import { translate } from "../locales.ts";
import { sendMessage } from "../messages.ts";
import type { LocalStorageItemsBackupRestore } from "../types.ts";
import { downloadTextFile, parseJSON, uploadTextFile } from "../utilities.ts";

export const BackupRestoreSection: React.FC = () => {
  const [fileInvalid, setFileInvalid] = useState(false);

  return (
    <Section aria-labelledby="backupRestoreSectionTitle" id="backupRestore">
      <SectionHeader>
        <SectionTitle id="backupRestoreSectionTitle">
          {translate("options_backupRestoreTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <Label>{translate("options_backupSettingsLabel")}</Label>
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Button
                onClick={async () => {
                  const items = await sendMessage("backup-settings");
                  downloadTextFile(
                    "ublacklist-settings.json",
                    "application/json",
                    JSON.stringify(
                      {
                        ...items,
                        version: browser.runtime.getManifest().version,
                      },
                      null,
                      2,
                    ),
                  );
                }}
              >
                {translate("options_backupSettingsButton")}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <Label>{translate("options_restoreSettingsLabel")}</Label>
                {fileInvalid && (
                  <SubLabel>
                    {translate(
                      "error",
                      translate("options_restoreSettingsInvalidFile"),
                    )}
                  </SubLabel>
                )}
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Button
                onClick={async () => {
                  const text = await uploadTextFile("application/json");
                  if (text == null) {
                    return;
                  }
                  const parseResult = z
                    .object({
                      blacklist: z.string().optional(),
                      blockWholeSite: z.boolean().optional(),
                      skipBlockDialog: z.boolean().optional(),
                      hideBlockLinks: z.boolean().optional(),
                      hideControl: z.boolean().optional(),
                      enablePathDepth: z.boolean().optional(),
                      linkColor: z.string().optional(),
                      blockColor: z.string().optional(),
                      highlightColors: z.string().array().optional(),
                      dialogTheme: z
                        .enum(["light", "dark", "default"])
                        .optional(),
                      syncBlocklist: z.boolean().optional(),
                      syncGeneral: z.boolean().optional(),
                      syncAppearance: z.boolean().optional(),
                      syncSubscriptions: z.boolean().optional(),
                      syncInterval: z.number().optional(),
                      subscriptions: z
                        .object({
                          name: z.string(),
                          url: z.string(),
                          enabled: z.boolean(),
                        })
                        .array()
                        .optional(),
                      updateInterval: z.number().optional(),
                      version: z.string().optional(),
                    })
                    .safeParse(parseJSON(text));
                  setFileInvalid(!parseResult.success);
                  if (!parseResult.success) {
                    return;
                  }
                  await sendMessage(
                    "restore-settings",
                    parseResult.data as Partial<LocalStorageItemsBackupRestore>,
                  );
                  // Reload without query parameters
                  window.location.assign(window.location.pathname);
                }}
              >
                {translate("options_restoreSettingsButton")}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <Label>{translate("options_initializeSettingsLabel")}</Label>
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Button
                onClick={async () => {
                  const confirmed = window.confirm(
                    translate("options_initializeSettingsConfirmation"),
                  );
                  if (!confirmed) {
                    return;
                  }
                  await sendMessage("initialize-settings");
                  // Reload without query parameters
                  window.location.assign(window.location.pathname);
                }}
              >
                {translate("options_initializeSettingsButton")}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
      </SectionBody>
    </Section>
  );
};

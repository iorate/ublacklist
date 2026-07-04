import { Button } from "@base-ui/react/button";
import clsx from "clsx";
import { useId, useState } from "react";
import { z } from "zod";
import buttonStyles from "../components/button.module.css";
import labelStyles from "../components/label.module.css";
import rowStyles from "../components/row.module.css";
import sectionStyles from "../components/section.module.css";
import { browser } from "../shared/browser.ts";
import { translate } from "../shared/locales.ts";
import { sendMessage } from "../shared/messages.ts";
import * as SerpInfoSettings from "../shared/serpinfo-settings.ts";
import type { LocalStorageItemsBackupRestore } from "../shared/types.ts";
import {
  downloadTextFile,
  parseJSON,
  uploadTextFile,
} from "../shared/utilities.ts";

export const BackupRestoreSection: React.FC<{ id: string }> = (props) => {
  const id = useId();
  const [fileInvalid, setFileInvalid] = useState(false);

  return (
    <section
      className={sectionStyles.section}
      aria-labelledby={`${id}-title`}
      id={props.id}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_backupRestoreTitle")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <div className={sectionStyles.item}>
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <div className={labelStyles.wrapper}>
                <div className={labelStyles.label}>
                  {translate("options_backupSettingsLabel")}
                </div>
              </div>
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.secondary)}
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
            </div>
          </div>
        </div>
        <div className={sectionStyles.item}>
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <div className={labelStyles.wrapper}>
                <div className={labelStyles.label}>
                  {translate("options_restoreSettingsLabel")}
                </div>
                {fileInvalid && (
                  <div className={labelStyles.subLabel}>
                    {translate(
                      "error",
                      translate("options_restoreSettingsInvalidFile"),
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.secondary)}
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
                      enableMatchingRules: z.boolean().optional(),
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
                      syncSerpInfo: z.boolean().optional(),
                      syncInterval: z.number().optional(),
                      subscriptions: z
                        .object({
                          name: z.string(),
                          url: z.string(),
                          type: z.enum(["ruleset", "domains"]).optional(),
                          enabled: z.boolean(),
                        })
                        .array()
                        .optional(),
                      updateInterval: z.number().optional(),
                      serpInfoSettings:
                        SerpInfoSettings.serializableSchema.optional(),
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
            </div>
          </div>
        </div>
        <div className={sectionStyles.item}>
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <div className={labelStyles.wrapper}>
                <div className={labelStyles.label}>
                  {translate("options_resetSettingsLabel")}
                </div>
              </div>
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.secondary)}
                onClick={async () => {
                  const confirmed = window.confirm(
                    translate("options_resetSettingsConfirmation"),
                  );
                  if (!confirmed) {
                    return;
                  }
                  await sendMessage("reset-settings");
                  // Reload without query parameters
                  window.location.assign(window.location.pathname);
                }}
              >
                {translate("options_resetSettingsButton")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

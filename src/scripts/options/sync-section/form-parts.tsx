import { Button } from "@base-ui/react/button";
import clsx from "clsx";
import { useId } from "react";
import { DialogTitle } from "../../components/dialog.tsx";
import { Select, SelectOption } from "../../components/select.tsx";
import { translate } from "../../shared/locales.ts";
import type { SyncBackendId, SyncForce } from "../../shared/types.ts";
import buttonStyles from "../../styles/button.module.css";
import dialogStyles from "../../styles/dialog.module.css";
import labelStyles from "../../styles/label.module.css";
import rowStyles from "../../styles/row.module.css";
import textStyles from "../../styles/text.module.css";
import { getOS } from "../shared/platform.ts";
import { messageNames } from "./message-names.ts";

export function FormHeader() {
  return (
    <div className={dialogStyles.header}>
      <DialogTitle>{translate("options_turnOnSyncDialog_title")}</DialogTitle>
    </div>
  );
}

export function BackendSelect({
  disabled,
  value,
  onValueChange,
}: {
  disabled: boolean;
  value: SyncBackendId;
  onValueChange: (value: SyncBackendId) => void;
}) {
  return (
    <>
      <div className={rowStyles.row}>
        <div className={rowStyles.rowItem}>
          <Select
            disabled={disabled}
            value={value}
            onValueChange={(value) => {
              onValueChange(value as SyncBackendId);
            }}
          >
            <SelectOption value="googleDrive">
              {translate(messageNames.googleDrive.sync)}
            </SelectOption>
            <SelectOption value="dropbox">
              {translate(messageNames.dropbox.sync)}
            </SelectOption>
            <SelectOption value="webdav">
              {translate(messageNames.webdav.sync)}
            </SelectOption>
            {(process.env.BROWSER === "chrome" ||
              process.env.BROWSER === "edge" ||
              (process.env.BROWSER === "firefox" && getOS() !== "android")) && (
              <SelectOption value="browserSync">
                {translate(messageNames.browserSync.sync)}
              </SelectOption>
            )}
          </Select>
        </div>
      </div>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <span className={textStyles.secondary}>
            {translate(messageNames[value].syncDescription)}
          </span>
        </div>
      </div>
    </>
  );
}

export function InitialSyncSelect({
  disabled,
  value,
  onValueChange,
}: {
  disabled: boolean;
  value: SyncForce;
  onValueChange: (value: SyncForce) => void;
}) {
  const id = useId();
  return (
    <div className={rowStyles.row}>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
          <label
            className={labelStyles.controlLabel}
            htmlFor={`${id}-initial-direction`}
          >
            {translate("options_turnOnSyncDialog_initialSyncLabel")}
          </label>
        </div>
        <Select
          disabled={disabled}
          id={`${id}-initial-direction`}
          value={value}
          onValueChange={(value) => {
            onValueChange(value as SyncForce);
          }}
        >
          <SelectOption value="none">
            {translate("options_turnOnSyncDialog_initialSyncLastWriteWins")}
          </SelectOption>
          <SelectOption value="upload">
            {translate("options_turnOnSyncDialog_initialSyncUseLocal")}
          </SelectOption>
          <SelectOption value="download">
            {translate("options_turnOnSyncDialog_initialSyncUseRemote")}
          </SelectOption>
        </Select>
      </div>
    </div>
  );
}

export function FormFooter({
  close,
  errorMessage,
  okButtonEnabled,
  onOKButtonClick,
}: {
  close: () => void;
  errorMessage: string;
  okButtonEnabled: boolean;
  onOKButtonClick: () => void;
}) {
  return (
    <div className={dialogStyles.footer}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          {errorMessage && (
            <span className={textStyles.secondary}>
              {translate("error", errorMessage)}
            </span>
          )}
        </div>
        <div className={rowStyles.rowItem}>
          <Button
            className={clsx(buttonStyles.button, buttonStyles.secondary)}
            onClick={close}
          >
            {translate("cancelButton")}
          </Button>
        </div>
        <div className={rowStyles.rowItem}>
          <Button
            className={clsx(buttonStyles.button, buttonStyles.primary)}
            disabled={!okButtonEnabled}
            onClick={onOKButtonClick}
          >
            {translate("options_turnOnSyncDialog_turnOnSyncButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}

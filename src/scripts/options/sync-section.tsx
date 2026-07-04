import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import { Input } from "@base-ui/react/input";
import clsx from "clsx";
import dayjs from "dayjs";
import dayjsDuration from "dayjs/plugin/duration";
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
import indentStyles from "../components/indent.module.css";
import inputStyles from "../components/input.module.css";
import labelStyles from "../components/label.module.css";
import listStyles from "../components/list.module.css";
import rowStyles from "../components/row.module.css";
import sectionStyles from "../components/section.module.css";
import textStyles from "../components/text.module.css";
import textareaStyles from "../components/textarea.module.css";
import { browser } from "../shared/browser.ts";
import "../shared/dayjs-locales.ts";
import { Select, SelectOption } from "../components/select.tsx";
import { getWebsiteURL, translate } from "../shared/locales.ts";
import { addMessageListeners, sendMessage } from "../shared/messages.ts";
import { storageStore } from "../shared/storage-store.ts";
import { supportedClouds } from "../shared/supported-clouds.ts";
import type {
  MessageName0,
  SyncBackendId,
  SyncForce,
} from "../shared/types.ts";
import { AltURL, isErrorResult } from "../shared/utilities.ts";
import { FromNow } from "./from-now.tsx";
import { getOS } from "./platform.ts";
import { SetBooleanItem } from "./set-boolean-item.tsx";
import { SetIntervalItem } from "./set-interval-item.tsx";

dayjs.extend(dayjsDuration);

const altFlowRedirectURL = getWebsiteURL("/callback");

const messageNames: Record<
  SyncBackendId,
  Record<"sync" | "syncTurnedOn" | "syncDescription", MessageName0>
> = {
  googleDrive: {
    sync: "clouds_googleDriveSync",
    syncTurnedOn: "clouds_googleDriveSyncTurnedOn",
    syncDescription: "clouds_googleDriveSyncDescription",
  },
  dropbox: {
    sync: "clouds_dropboxSync",
    syncTurnedOn: "clouds_dropboxSyncTurnedOn",
    syncDescription: "clouds_dropboxSyncDescription",
  },
  webdav: {
    sync: "clouds_webdavSync",
    syncTurnedOn: "clouds_webdavSyncTurnedOn",
    syncDescription: "clouds_webdavSyncDescription",
  },
  browserSync: {
    sync: "clouds_browserSync",
    syncTurnedOn: "clouds_browserSyncTurnedOn",
    syncDescription: "clouds_browserSyncDescription",
  },
};

const TurnOnSyncForm: React.FC<{ close: () => void }> = ({ close }) => {
  const id = useId();
  const [phase, setPhase] = useState<
    "none" | "auth" | "auth-alt" | "conn" | "conn-alt"
  >("none");
  const [backendId, setBackendId] = useState<SyncBackendId>("googleDrive");
  const [useAltFlow, setUseAltFlow] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [webDAVURL, setWebDAVURL] = useState("");
  const [webDAVURLValid, setWebDAVURLValid] = useState(false);
  const [webDAVUsername, setWebDAVUsername] = useState("");
  const [webDAVPassword, setWebDAVPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [initialForce, setInitialForce] = useState<SyncForce>("none");
  const forceAltFlow =
    backendId === "webdav" || backendId === "browserSync"
      ? false
      : supportedClouds[backendId].shouldUseAltFlow(getOS());
  const okButtonEnabled =
    backendId === "webdav"
      ? phase === "none" && webDAVURLValid
      : backendId === "browserSync"
        ? true
        : phase === "none" || (phase === "auth-alt" && authCode !== "");

  return (
    <>
      <DialogHeader>
        <DialogTitle>{translate("options_turnOnSyncDialog_title")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className={rowStyles.row}>
          <div className={rowStyles.rowItem}>
            <Select
              disabled={phase !== "none"}
              value={backendId}
              onValueChange={(value) => {
                setBackendId(value as SyncBackendId);
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
                (process.env.BROWSER === "firefox" &&
                  getOS() !== "android")) && (
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
              {translate(messageNames[backendId].syncDescription)}
            </span>
          </div>
        </div>
        {backendId === "webdav" ? (
          <>
            <div className={rowStyles.row}>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div
                  className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}
                >
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${id}-webdav-url`}
                  >
                    {translate("clouds_webdavUrlLabel")}
                  </label>
                  <div className={labelStyles.subLabel}>
                    {translate("clouds_webdavUrlDescription")}
                  </div>
                </div>
                <Input
                  className={inputStyles.input}
                  disabled={phase !== "none"}
                  id={`${id}-webdav-url`}
                  pattern="https?:.*"
                  placeholder="https://example.com/webdav/"
                  type="url"
                  value={webDAVURL}
                  onChange={(e) => {
                    const {
                      value,
                      validity: { valid },
                    } = e.currentTarget;
                    setWebDAVURL(value);
                    setWebDAVURLValid(valid);
                  }}
                />
              </div>
            </div>
            <div className={rowStyles.row}>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div
                  className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}
                >
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${id}-webdav-username`}
                  >
                    {translate("clouds_webdavUsernameLabel")}
                  </label>
                </div>
                <Input
                  className={inputStyles.input}
                  disabled={phase !== "none"}
                  id={`${id}-webdav-username`}
                  value={webDAVUsername}
                  onChange={(e) => {
                    setWebDAVUsername(e.currentTarget.value);
                  }}
                />
              </div>
            </div>
            <div className={rowStyles.row}>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div
                  className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}
                >
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${id}-webdav-password`}
                  >
                    {translate("clouds_webdavPasswordLabel")}
                  </label>
                </div>
                <Input
                  className={inputStyles.input}
                  disabled={phase !== "none"}
                  id={`${id}-webdav-password`}
                  type="password"
                  value={webDAVPassword}
                  onChange={(e) => {
                    setWebDAVPassword(e.currentTarget.value);
                  }}
                />
              </div>
            </div>
          </>
        ) : backendId === "browserSync" ? null : (
          <>
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <div className={indentStyles.indent}>
                  <Checkbox.Root
                    checked={forceAltFlow || useAltFlow}
                    className={styles.checkbox}
                    disabled={phase !== "none" || forceAltFlow}
                    id={`${id}-use-alt-flow`}
                    onCheckedChange={setUseAltFlow}
                  >
                    <Checkbox.Indicator className={styles.indicator} />
                  </Checkbox.Root>
                </div>
              </div>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <div
                  className={clsx(
                    labelStyles.wrapper,
                    (phase !== "none" || forceAltFlow) && labelStyles.disabled,
                  )}
                >
                  <label
                    className={labelStyles.controlLabel}
                    htmlFor={`${id}-use-alt-flow`}
                  >
                    {translate("options_turnOnSyncDialog_useAltFlow")}
                  </label>
                </div>
              </div>
            </div>
            {(forceAltFlow || useAltFlow) && (
              <div className={rowStyles.row}>
                <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                  <span className={textStyles.secondary}>
                    {translate(
                      "options_turnOnSyncDialog_altFlowDescription",
                      new AltURL(altFlowRedirectURL).host,
                    )}
                  </span>
                </div>
              </div>
            )}
            {(phase === "auth-alt" || phase === "conn-alt") && (
              <div className={rowStyles.row}>
                <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                  <div
                    className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}
                  >
                    <label
                      className={labelStyles.controlLabel}
                      htmlFor={`${id}-auth-code`}
                    >
                      {translate(
                        "options_turnOnSyncDialog_altFlowAuthCodeLabel",
                      )}
                    </label>
                  </div>
                  <textarea
                    className={clsx(
                      textareaStyles.textArea,
                      textareaStyles.breakAll,
                    )}
                    disabled={phase !== "auth-alt"}
                    id={`${id}-auth-code`}
                    rows={2}
                    style={{ height: "calc(1.5em * 2 + 1em + 2px)" }}
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.currentTarget.value);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
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
              disabled={phase !== "none"}
              id={`${id}-initial-direction`}
              value={initialForce}
              onValueChange={(value) => {
                setInitialForce(value as SyncForce);
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
      </DialogBody>
      <DialogFooter>
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
              onClick={() => {
                void (async () => {
                  if (backendId === "webdav") {
                    // phase === "none"
                    try {
                      const origins = [new AltURL(webDAVURL).toString()];
                      const granted = await browser.permissions.request({
                        origins,
                      });
                      if (!granted) {
                        return;
                      }
                    } catch {
                      return;
                    }
                    setPhase("conn");
                    try {
                      const error = await sendMessage(
                        "connect-to-webdav",
                        {
                          url: webDAVURL,
                          username: webDAVUsername,
                          password: webDAVPassword,
                          path: "",
                        },
                        initialForce,
                      );
                      if (error) {
                        setErrorMessage(error.message);
                        return;
                      }
                    } catch {
                      return;
                    } finally {
                      setPhase("none");
                    }
                    close();
                    return;
                  }
                  if (backendId === "browserSync") {
                    try {
                      const error = await sendMessage(
                        "connect-to-browser-sync",
                        initialForce,
                      );
                      if (error) {
                        setErrorMessage(error.message);
                        return;
                      }
                    } catch {
                      return;
                    }
                    close();
                    return;
                  }
                  const selectedCloud = supportedClouds[backendId];
                  let altFlow: boolean;
                  let authorizationCode: string;
                  if (phase === "auth-alt") {
                    altFlow = true;
                    authorizationCode = authCode;
                  } else {
                    altFlow = forceAltFlow || useAltFlow;
                    setPhase(altFlow ? "auth-alt" : "auth");
                    try {
                      const origins = [
                        ...selectedCloud.hostPermissions,
                        ...(altFlow ? [altFlowRedirectURL] : []),
                      ];
                      const granted = await browser.permissions.request({
                        origins,
                      });
                      if (!granted) {
                        return;
                      }
                      authorizationCode = (
                        await selectedCloud.authorize(altFlow)
                      ).authorizationCode;
                    } catch {
                      setPhase("none");
                      return;
                    }
                  }
                  setPhase(altFlow ? "conn-alt" : "conn");
                  try {
                    const error = await sendMessage(
                      "connect-to-cloud",
                      backendId,
                      authorizationCode,
                      altFlow,
                      initialForce,
                    );
                    if (error) {
                      setErrorMessage(error.message);
                      return;
                    }
                  } catch {
                    return;
                  } finally {
                    setPhase("none");
                  }
                  close();
                })();
              }}
            >
              {translate("options_turnOnSyncDialog_turnOnSyncButton")}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </>
  );
};

const TurnOnSyncDialog: React.FC<{ close: () => void; open: boolean }> = ({
  close,
  open,
}) => (
  <Dialog close={close} open={open}>
    <TurnOnSyncForm close={close} />
  </Dialog>
);

const TurnOnSync: React.FC<{
  backendId: SyncBackendId | false | null;
}> = ({ backendId }) => {
  const [turnOnSyncDialogOpen, setTurnOnSyncDialogOpen] = useState(false);
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          {backendId ? (
            <div className={labelStyles.wrapper}>
              <div className={labelStyles.label}>
                {translate(messageNames[backendId].syncTurnedOn)}
              </div>
            </div>
          ) : (
            <div className={labelStyles.wrapper}>
              <div className={labelStyles.label}>
                {translate("options_syncFeature")}
              </div>
              <div className={labelStyles.subLabel}>
                {translate("options_syncFeatureDescription")}
              </div>
            </div>
          )}
        </div>
        <div className={rowStyles.rowItem}>
          {backendId ? (
            <Button
              className={clsx(buttonStyles.button, buttonStyles.secondary)}
              onClick={() => {
                void sendMessage("disconnect-from-cloud");
              }}
            >
              {translate("options_turnOffSync")}
            </Button>
          ) : (
            <Button
              className={clsx(buttonStyles.button, buttonStyles.primary)}
              onClick={() => {
                setTurnOnSyncDialogOpen(true);
              }}
            >
              {translate("options_turnOnSync")}
            </Button>
          )}
        </div>
      </div>
      <TurnOnSyncDialog
        close={() => setTurnOnSyncDialogOpen(false)}
        open={turnOnSyncDialogOpen}
      />
    </div>
  );
};

const SyncNow: React.FC<{ backendId: SyncBackendId | false | null }> = (
  props,
) => {
  const syncResult = storageStore.use.syncResult();
  const [updated, setUpdated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  useEffect(
    () =>
      addMessageListeners({
        syncing: (id) => {
          if (id !== props.backendId) {
            return;
          }
          setUpdated(false);
          setSyncing(true);
        },
        synced: (id, _result, updated) => {
          if (id !== props.backendId) {
            return;
          }
          setUpdated(updated);
          setSyncing(false);
        },
      }),
    [props.backendId],
  );
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_syncResult")}
            </div>
            <div className={labelStyles.subLabel}>
              {syncing ? (
                translate("options_syncRunning")
              ) : !props.backendId || !syncResult ? (
                translate("options_syncNever")
              ) : isErrorResult(syncResult) ? (
                translate("error", syncResult.message)
              ) : (
                <FromNow time={dayjs(syncResult.timestamp)} />
              )}
              {updated ? (
                <>
                  {" "}
                  <Button
                    className={buttonStyles.linkButton}
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    {translate("options_syncReloadButton")}
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className={rowStyles.rowItem}>
          <Button
            className={clsx(buttonStyles.button, buttonStyles.secondary)}
            disabled={syncing || !props.backendId}
            onClick={() => {
              void sendMessage("sync");
            }}
          >
            {translate("options_syncNowButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SyncCategories: React.FC = () => (
  <div className={sectionStyles.item}>
    <div className={rowStyles.row}>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <div className={labelStyles.wrapper}>
          <div className={labelStyles.label}>
            {translate("options_syncCategories")}
          </div>
        </div>
      </div>
    </div>
    <div className={rowStyles.row}>
      <div className={rowStyles.rowItem}>
        <div className={indentStyles.indent} />
      </div>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <ul className={listStyles.list}>
          <li className={listStyles.item}>
            <SetBooleanItem
              itemKey="syncBlocklist"
              label={translate("options_syncBlocklist")}
            />
          </li>
          <li className={listStyles.item}>
            <SetBooleanItem
              itemKey="syncGeneral"
              label={translate("options_syncGeneral")}
            />
          </li>
          <li className={listStyles.item}>
            <SetBooleanItem
              itemKey="syncAppearance"
              label={translate("options_syncAppearance")}
            />
          </li>
          <li className={listStyles.item}>
            <SetBooleanItem
              itemKey="syncSubscriptions"
              label={translate("options_syncSubscriptions")}
            />
          </li>
          <li className={listStyles.item}>
            <SetBooleanItem
              itemKey="syncSerpInfo"
              label={translate("options_syncSerpInfo")}
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export const SyncSection: React.FC<{ id: string }> = (props) => {
  const id = useId();
  const backendId = storageStore.use.syncCloudId();
  return (
    <section
      className={sectionStyles.section}
      aria-labelledby={`${id}-title`}
      id={props.id}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_syncTitle")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <TurnOnSync backendId={backendId} />
        <SyncNow backendId={backendId} />
        <SyncCategories />
        <div className={sectionStyles.item}>
          <SetIntervalItem
            disabled={!backendId}
            itemKey="syncInterval"
            label={translate("options_syncInterval")}
            valueOptions={[5, 10, 15, 30, 60, 120]}
          />
        </div>
      </div>
    </section>
  );
};

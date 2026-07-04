import { Checkbox } from "@base-ui/react/checkbox";
import dayjs from "dayjs";
import dayjsDuration from "dayjs/plugin/duration";
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
import { Indent } from "../components/indent.tsx";
import {
  ControlLabel,
  Label,
  LabelWrapper,
  SubLabel,
} from "../components/label.tsx";
import { List, ListItem } from "../components/list.tsx";
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
import "../shared/dayjs-locales.ts";
import { Input } from "../components/input.tsx";
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
import { Select, SelectOption } from "./select.tsx";
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
        <Row>
          <RowItem>
            <Select
              disabled={phase !== "none"}
              value={backendId}
              onChange={(e) => {
                setBackendId(e.currentTarget.value as SyncBackendId);
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
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Text>{translate(messageNames[backendId].syncDescription)}</Text>
          </RowItem>
        </Row>
        {backendId === "webdav" ? (
          <>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-webdav-url`}>
                    {translate("clouds_webdavUrlLabel")}
                  </ControlLabel>
                  <SubLabel>
                    {translate("clouds_webdavUrlDescription")}
                  </SubLabel>
                </LabelWrapper>
                <Input
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
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-webdav-username`}>
                    {translate("clouds_webdavUsernameLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={phase !== "none"}
                  id={`${id}-webdav-username`}
                  value={webDAVUsername}
                  onChange={(e) => {
                    setWebDAVUsername(e.currentTarget.value);
                  }}
                />
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-webdav-password`}>
                    {translate("clouds_webdavPasswordLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={phase !== "none"}
                  id={`${id}-webdav-password`}
                  type="password"
                  value={webDAVPassword}
                  onChange={(e) => {
                    setWebDAVPassword(e.currentTarget.value);
                  }}
                />
              </RowItem>
            </Row>
          </>
        ) : backendId === "browserSync" ? null : (
          <>
            <Row>
              <RowItem>
                <Indent>
                  <Checkbox.Root
                    checked={forceAltFlow || useAltFlow}
                    className={styles.checkbox}
                    disabled={phase !== "none" || forceAltFlow}
                    id={`${id}-use-alt-flow`}
                    onCheckedChange={setUseAltFlow}
                  >
                    <Checkbox.Indicator className={styles.indicator} />
                  </Checkbox.Root>
                </Indent>
              </RowItem>
              <RowItem expanded>
                <LabelWrapper disabled={phase !== "none" || forceAltFlow}>
                  <ControlLabel for={`${id}-use-alt-flow`}>
                    {translate("options_turnOnSyncDialog_useAltFlow")}
                  </ControlLabel>
                </LabelWrapper>
              </RowItem>
            </Row>
            {(forceAltFlow || useAltFlow) && (
              <Row>
                <RowItem expanded>
                  <Text>
                    {translate(
                      "options_turnOnSyncDialog_altFlowDescription",
                      new AltURL(altFlowRedirectURL).host,
                    )}
                  </Text>
                </RowItem>
              </Row>
            )}
            {(phase === "auth-alt" || phase === "conn-alt") && (
              <Row>
                <RowItem expanded>
                  <LabelWrapper fullWidth>
                    <ControlLabel for={`${id}-auth-code`}>
                      {translate(
                        "options_turnOnSyncDialog_altFlowAuthCodeLabel",
                      )}
                    </ControlLabel>
                  </LabelWrapper>
                  <TextArea
                    breakAll
                    disabled={phase !== "auth-alt"}
                    id={`${id}-auth-code`}
                    rows={2}
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.currentTarget.value);
                    }}
                  />
                </RowItem>
              </Row>
            )}
          </>
        )}
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for={`${id}-initial-direction`}>
                {translate("options_turnOnSyncDialog_initialSyncLabel")}
              </ControlLabel>
            </LabelWrapper>
            <Select
              disabled={phase !== "none"}
              id={`${id}-initial-direction`}
              value={initialForce}
              onChange={(e) => {
                setInitialForce(e.currentTarget.value as SyncForce);
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
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row>
          <RowItem expanded>
            {errorMessage && <Text>{translate("error", errorMessage)}</Text>}
          </RowItem>
          <RowItem>
            <Button onClick={close}>{translate("cancelButton")}</Button>
          </RowItem>
          <RowItem>
            <Button
              disabled={!okButtonEnabled}
              primary
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
          </RowItem>
        </Row>
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
    <SectionItem>
      <Row>
        <RowItem expanded>
          {backendId ? (
            <LabelWrapper>
              <Label>{translate(messageNames[backendId].syncTurnedOn)}</Label>
            </LabelWrapper>
          ) : (
            <LabelWrapper>
              <Label>{translate("options_syncFeature")}</Label>
              <SubLabel>{translate("options_syncFeatureDescription")}</SubLabel>
            </LabelWrapper>
          )}
        </RowItem>
        <RowItem>
          {backendId ? (
            <Button
              onClick={() => {
                void sendMessage("disconnect-from-cloud");
              }}
            >
              {translate("options_turnOffSync")}
            </Button>
          ) : (
            <Button
              primary
              onClick={() => {
                setTurnOnSyncDialogOpen(true);
              }}
            >
              {translate("options_turnOnSync")}
            </Button>
          )}
        </RowItem>
      </Row>
      <TurnOnSyncDialog
        close={() => setTurnOnSyncDialogOpen(false)}
        open={turnOnSyncDialogOpen}
      />
    </SectionItem>
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
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate("options_syncResult")}</Label>
            <SubLabel>
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
                  <LinkButton
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    {translate("options_syncReloadButton")}
                  </LinkButton>
                </>
              ) : null}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <Button
            disabled={syncing || !props.backendId}
            onClick={() => {
              void sendMessage("sync");
            }}
          >
            {translate("options_syncNowButton")}
          </Button>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

const SyncCategories: React.FC = () => (
  <SectionItem>
    <Row>
      <RowItem expanded>
        <LabelWrapper>
          <Label>{translate("options_syncCategories")}</Label>
        </LabelWrapper>
      </RowItem>
    </Row>
    <Row>
      <RowItem>
        <Indent />
      </RowItem>
      <RowItem expanded>
        <List>
          <ListItem>
            <SetBooleanItem
              itemKey="syncBlocklist"
              label={translate("options_syncBlocklist")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              itemKey="syncGeneral"
              label={translate("options_syncGeneral")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              itemKey="syncAppearance"
              label={translate("options_syncAppearance")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              itemKey="syncSubscriptions"
              label={translate("options_syncSubscriptions")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              itemKey="syncSerpInfo"
              label={translate("options_syncSerpInfo")}
            />
          </ListItem>
        </List>
      </RowItem>
    </Row>
  </SectionItem>
);

export const SyncSection: React.FC<{ id: string }> = (props) => {
  const id = useId();
  const backendId = storageStore.use.syncCloudId();
  return (
    <Section aria-labelledby={`${id}-title`} id={props.id}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
          {translate("options_syncTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <TurnOnSync backendId={backendId} />
        <SyncNow backendId={backendId} />
        <SyncCategories />
        <SectionItem>
          <SetIntervalItem
            disabled={!backendId}
            itemKey="syncInterval"
            label={translate("options_syncInterval")}
            valueOptions={[5, 10, 15, 30, 60, 120]}
          />
        </SectionItem>
      </SectionBody>
    </Section>
  );
};

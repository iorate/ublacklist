import dayjs from "dayjs";
import dayjsDuration from "dayjs/plugin/duration";
import { useEffect, useId, useState } from "react";
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
import { List, ListItem } from "../components/list.tsx";
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
import "../dayjs-locales.ts";
import { Input } from "../components/input.tsx";
import { getWebsiteURL, translate } from "../locales.ts";
import { addMessageListeners, sendMessage } from "../messages.ts";
import { supportedClouds } from "../supported-clouds.ts";
import type { CloudId } from "../types.ts";
import { AltURL, isErrorResult, stringEntries } from "../utilities.ts";
import { FromNow } from "./from-now.tsx";
import { useOptionsContext } from "./options-context.tsx";
import { Select, SelectOption } from "./select.tsx";
import { SetBooleanItem } from "./set-boolean-item.tsx";
import { SetIntervalItem } from "./set-interval-item.tsx";

dayjs.extend(dayjsDuration);

const altFlowRedirectURL = getWebsiteURL("/callback");

const TurnOnSyncDialog: React.FC<
  {
    setSyncCloudId: React.Dispatch<
      React.SetStateAction<CloudId | false | null>
    >;
  } & DialogProps
> = ({ close, open, setSyncCloudId }) => {
  const id = useId();
  const {
    platformInfo: { os },
  } = useOptionsContext();
  const [state, setState] = useState({
    phase: "none" as "none" | "auth" | "auth-alt" | "conn" | "conn-alt",
    selectedCloudId: "googleDrive" as CloudId,
    useAltFlow: false,
    authCode: "",
  });
  const [params, setParams] = useState<Record<string, string>>({});
  const prevOpen = usePrevious(open);
  const selectedCloud = supportedClouds[state.selectedCloudId];
  selectedCloud.requiredParams.forEach((param) => {
    if (!(param.key in params) && param.default) {
      params[param.key] = param.default;
    }
  });
  if (open && !prevOpen) {
    state.phase = "none";
    state.selectedCloudId = "googleDrive";
    state.useAltFlow = false;
    state.authCode = "";
    setParams({});
  }
  const forceAltFlow =
    selectedCloud.type === "oauth" && selectedCloud.shouldUseAltFlow(os);

  return (
    <Dialog aria-labelledby={`${id}-title`} close={close} open={open}>
      <DialogHeader>
        <DialogTitle id={`${id}-title`}>
          {translate("options_turnOnSyncDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem>
            <Select
              className={state.phase === "none" ? FOCUS_START_CLASS : ""}
              disabled={state.phase !== "none"}
              value={state.selectedCloudId}
              onChange={(e) => {
                const { value } = e.currentTarget;
                setState((s) => ({
                  ...s,
                  selectedCloudId: value as CloudId,
                }));
              }}
            >
              {stringEntries(supportedClouds).map(([id, cloud]) => (
                <SelectOption key={id} value={id}>
                  {translate(cloud.messageNames.sync)}
                </SelectOption>
              ))}
            </Select>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Text>
              {translate(
                supportedClouds[state.selectedCloudId].messageNames
                  .syncDescription,
              )}
            </Text>
          </RowItem>
        </Row>
        {selectedCloud.type === "oauth" && (
          <Row>
            <RowItem>
              <Indent>
                <CheckBox
                  checked={forceAltFlow || state.useAltFlow}
                  disabled={state.phase !== "none" || forceAltFlow}
                  id={`${id}-use-alt-flow`}
                  onChange={(e) => {
                    const { checked } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      useAltFlow: checked,
                    }));
                  }}
                />
              </Indent>
            </RowItem>
            <RowItem expanded>
              <LabelWrapper disabled={state.phase !== "none" || forceAltFlow}>
                <ControlLabel for={`${id}-use-alt-flow`}>
                  {translate("options_turnOnSyncDialog_useAltFlow")}
                </ControlLabel>
              </LabelWrapper>
            </RowItem>
          </Row>
        )}
        {(forceAltFlow || state.useAltFlow) && (
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
        {state.phase === "auth-alt" || state.phase === "conn-alt" ? (
          <Row>
            <RowItem expanded>
              <LabelWrapper fullWidth>
                <ControlLabel for={`${id}-auth-code`}>
                  {translate("options_turnOnSyncDialog_altFlowAuthCodeLabel")}
                </ControlLabel>
              </LabelWrapper>
              <TextArea
                breakAll
                className={state.phase === "auth-alt" ? FOCUS_START_CLASS : ""}
                disabled={state.phase !== "auth-alt"}
                id={`${id}-auth-code`}
                rows={2}
                value={state.authCode}
                onChange={(e) => {
                  const { value } = e.currentTarget;
                  setState((s) => ({ ...s, authCode: value }));
                }}
              />
            </RowItem>
          </Row>
        ) : null}
        {/* Render required params for selected cloud */}
        {selectedCloud.requiredParams?.map((param) => (
          // init params base on param default
          <Row key={param.key}>
            <RowItem expanded>
              <LabelWrapper fullWidth>
                <ControlLabel for={`${id}-param-${param.key}`}>
                  {translate(param.label)}
                </ControlLabel>
              </LabelWrapper>
              <Input
                id={`${id}-param-${param.key}`}
                type={param.type}
                value={params[param.key] || param.default || ""}
                placeholder={param.placeholder || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const currentTarget = e.currentTarget;
                  setParams((p) => ({
                    ...p,
                    [param.key]: currentTarget.value,
                  }));
                }}
                disabled={state.phase !== "none"}
              />
            </RowItem>
          </Row>
        ))}
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button
              className={
                state.phase === "auth" ||
                state.phase === "conn" ||
                state.phase === "conn-alt"
                  ? `${FOCUS_START_CLASS} ${FOCUS_END_CLASS}`
                  : state.phase === "auth-alt" && !state.authCode
                    ? FOCUS_END_CLASS
                    : ""
              }
              onClick={close}
            >
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              className={
                state.phase === "none" ||
                (state.phase === "auth-alt" && state.authCode)
                  ? FOCUS_END_CLASS
                  : ""
              }
              disabled={
                !(
                  state.phase === "none" ||
                  (state.phase === "auth-alt" && state.authCode)
                ) ||
                selectedCloud.requiredParams?.some(
                  (param) => param.required && !params[param.key],
                )
              }
              primary
              onClick={() => {
                void (async () => {
                  const selectedCloud = supportedClouds[state.selectedCloudId];
                  const isToken = selectedCloud.type === "token";
                  let useAltFlow: boolean;
                  let authCode: string;
                  if (isToken) {
                    // For WebDAV, call authorize with credentials to ensure folder exists
                    useAltFlow = false;
                    const credentials = {
                      url: params.url || "",
                      username: params.username || "",
                      password: params.password || "",
                      path: params.path || "",
                    };
                    const origins = [credentials.url];
                    const granted = await browser.permissions.request({
                      origins,
                    });
                    if (!granted) {
                      throw new Error("Not granted");
                    }
                    await selectedCloud.authorize(credentials);
                    authCode = JSON.stringify(credentials);
                    setState((s) => ({ ...s, phase: "conn" }));
                  } else if (state.phase === "auth-alt") {
                    useAltFlow = true;
                    authCode = state.authCode;
                  } else {
                    useAltFlow = forceAltFlow || state.useAltFlow;
                    setState((s) => ({
                      ...s,
                      phase: useAltFlow ? "auth-alt" : "auth",
                    }));
                    try {
                      const origins = [
                        ...selectedCloud.hostPermissions,
                        ...(useAltFlow ? [altFlowRedirectURL] : []),
                      ];
                      const granted = await browser.permissions.request({
                        origins,
                      });
                      if (!granted) {
                        throw new Error("Not granted");
                      }
                      authCode = (await selectedCloud.authorize({ useAltFlow }))
                        .authorizationCode;
                    } catch (err) {
                      console.error(
                        "[TurnOnSyncDialog] Error in OAuth flow:",
                        err,
                      );
                      setState((s) => ({ ...s, phase: "none" }));
                      return;
                    }
                  }
                  setState((s) => ({
                    ...s,
                    phase: useAltFlow ? "conn-alt" : "conn",
                  }));
                  try {
                    const authArg = authCode;
                    const connected = await sendMessage(
                      "connect-to-cloud",
                      state.selectedCloudId,
                      authArg,
                      useAltFlow,
                    );
                    if (!connected) {
                      throw new Error("Not connected");
                    }
                  } catch (err) {
                    console.error("[TurnOnSyncDialog] Connection error:", err);
                    return;
                  } finally {
                    setState((s) => ({ ...s, phase: "none" }));
                  }
                  setSyncCloudId(state.selectedCloudId);
                  close();
                })();
              }}
            >
              {translate("options_turnOnSyncDialog_turnOnSyncButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const TurnOnSync: React.FC<{
  syncCloudId: CloudId | false | null;
  setSyncCloudId: React.Dispatch<React.SetStateAction<CloudId | false | null>>;
}> = ({ syncCloudId, setSyncCloudId }) => {
  const id = useId();
  const [turnOnSyncDialogOpen, setTurnOnSyncDialogOpen] = useState(false);
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          {syncCloudId ? (
            <LabelWrapper>
              <Label>
                {translate(
                  supportedClouds[syncCloudId].messageNames.syncTurnedOn,
                )}
              </Label>
            </LabelWrapper>
          ) : (
            <LabelWrapper>
              <Label>{translate("options_syncFeature")}</Label>
              <SubLabel>{translate("options_syncFeatureDescription")}</SubLabel>
            </LabelWrapper>
          )}
        </RowItem>
        <RowItem>
          {syncCloudId ? (
            <Button
              onClick={() => {
                void sendMessage("disconnect-from-cloud");
                setSyncCloudId(false);
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
      <Portal id={`${id}-portal`}>
        <TurnOnSyncDialog
          close={() => setTurnOnSyncDialogOpen(false)}
          open={turnOnSyncDialogOpen}
          setSyncCloudId={setSyncCloudId}
        />
      </Portal>
    </SectionItem>
  );
};

const SyncNow: React.FC<{ syncCloudId: CloudId | false | null }> = (props) => {
  const {
    initialItems: { syncResult: initialSyncResult },
  } = useOptionsContext();
  const [syncResult, setSyncResult] = useState(initialSyncResult);
  const [updated, setUpdated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  useEffect(
    () =>
      addMessageListeners({
        syncing: (id) => {
          if (id !== props.syncCloudId) {
            return;
          }
          setUpdated(false);
          setSyncing(true);
        },
        synced: (id, result, updated) => {
          if (id !== props.syncCloudId) {
            return;
          }
          setSyncResult(result);
          setUpdated(updated);
          setSyncing(false);
        },
      }),
    [props.syncCloudId],
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
              ) : !props.syncCloudId || !syncResult ? (
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
            disabled={syncing || !props.syncCloudId}
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

const SyncCategories: React.FC<{ disabled: boolean }> = ({ disabled }) => (
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
              disabled={disabled}
              itemKey="syncBlocklist"
              label={translate("options_syncBlocklist")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
              itemKey="syncGeneral"
              label={translate("options_syncGeneral")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
              itemKey="syncAppearance"
              label={translate("options_syncAppearance")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
              itemKey="syncSubscriptions"
              label={translate("options_syncSubscriptions")}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
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
  const {
    initialItems: { syncCloudId: initialSyncCloudId },
  } = useOptionsContext();
  const [syncCloudId, setSyncCloudId] = useState(initialSyncCloudId);
  return (
    <Section aria-labelledby={`${id}-title`} id={props.id}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
          {translate("options_syncTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <TurnOnSync setSyncCloudId={setSyncCloudId} syncCloudId={syncCloudId} />
        <SyncNow syncCloudId={syncCloudId} />
        <SyncCategories disabled={!syncCloudId} />
        <SectionItem>
          <SetIntervalItem
            disabled={!syncCloudId}
            itemKey="syncInterval"
            label={translate("options_syncInterval")}
            valueOptions={[5, 10, 15, 30, 60, 120]}
          />
        </SectionItem>
      </SectionBody>
    </Section>
  );
};

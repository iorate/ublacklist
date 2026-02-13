import dayjs from "dayjs";
import dayjsDuration from "dayjs/plugin/duration";
import { useEffect, useId, useState } from "react";
import { browser } from "../browser.ts";
import { gitRepo } from "../clouds/git-repo.ts";
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
import { Link } from "../components/link.tsx";
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
import { useClassName, usePrevious } from "../components/utilities.ts";
import "../dayjs-locales.ts";
import { omit } from "es-toolkit";
import { Input } from "../components/input.tsx";
import { getWebsiteURL, translate } from "../locales.ts";
import { addMessageListeners, sendMessage } from "../messages.ts";
import { supportedClouds } from "../supported-clouds.ts";
import type { GitRepoPlatform, MessageName0, SyncBackendId } from "../types.ts";
import { AltURL, isErrorResult } from "../utilities.ts";
import { FromNow } from "./from-now.tsx";
import { useOptionsContext } from "./options-context.tsx";
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
  gitRepo: {
    sync: "clouds_gitRepoSync",
    syncTurnedOn: "clouds_gitRepoSyncTurnedOn",
    syncDescription: "clouds_gitRepoSyncDescription",
  },
};

const initialWebDAVParams = {
  url: "",
  urlValid: false,
  username: "",
  password: "",
  path: "/Apps/uBlacklist",
};

const initialGitRepoParams = {
  platform: "github" as GitRepoPlatform,
  folderUrl: "",
  owner: "",
  repo: "",
  branch: "main",
  path: "",
  token: "",
  apiBase: "",
  apiBaseValid: true,
  urlValid: false,
};

function getGitRepoPatLink(platform: GitRepoPlatform, apiBase: string): string {
  const cleanApiBase = apiBase.replace(/\/+$/, "");
  switch (platform) {
    case "github":
      return "https://github.com/settings/personal-access-tokens";
    case "codeberg":
      return "https://codeberg.org/user/settings/applications";
    case "gitlab": {
      const base = cleanApiBase
        ? cleanApiBase.replace(/\/api(?:\/v4)?\/?$/, "")
        : "https://gitlab.com";
      return `${base}/-/user_settings/personal_access_tokens`;
    }
    case "gitea": {
      const base = cleanApiBase
        ? cleanApiBase.replace(/\/api(?:\/v1)?\/?$/, "")
        : "https://gitea.com";
      return `${base}/user/settings/applications`;
    }
  }
}

const TurnOnSyncDialog: React.FC<
  {
    setBackendId: (id: SyncBackendId | false | null) => void;
  } & DialogProps
> = ({ close, open, setBackendId }) => {
  const id = useId();
  const fullWidthSelectClassName = useClassName(
    () => ({
      width: "100%",
    }),
    [],
  );
  const {
    platformInfo: { os },
  } = useOptionsContext();
  const [state, setState] = useState({
    phase: "none" as "none" | "auth" | "auth-alt" | "conn" | "conn-alt",
    backendId: "googleDrive" as SyncBackendId,
    useAltFlow: false,
    authCode: "",
    webDAVParams: initialWebDAVParams,
    gitRepoParams: initialGitRepoParams,
    errorMessage: "",
  });
  const prevOpen = usePrevious(open);
  if (open && !prevOpen) {
    state.phase = "none";
    state.backendId = "googleDrive";
    state.useAltFlow = false;
    state.authCode = "";
    state.webDAVParams = initialWebDAVParams;
    state.gitRepoParams = initialGitRepoParams;
    state.errorMessage = "";
  }
  const forceAltFlow =
    state.backendId === "webdav" ||
    state.backendId === "browserSync" ||
    state.backendId === "gitRepo"
      ? false
      : supportedClouds[state.backendId].shouldUseAltFlow(os);
  const okButtonEnabled =
    state.backendId === "webdav"
      ? state.phase === "none" && state.webDAVParams.urlValid
      : state.backendId === "browserSync"
        ? true
        : state.backendId === "gitRepo"
          ? state.phase === "none" &&
            state.gitRepoParams.owner !== "" &&
            state.gitRepoParams.repo !== "" &&
            state.gitRepoParams.token !== "" &&
            (state.gitRepoParams.platform !== "gitea"
              ? state.gitRepoParams.apiBase === "" ||
                state.gitRepoParams.apiBaseValid
              : state.gitRepoParams.apiBase !== "" &&
                state.gitRepoParams.apiBaseValid)
          : state.phase === "none" ||
            (state.phase === "auth-alt" && state.authCode !== "");
  const gitRepoPatLink = getGitRepoPatLink(
    state.gitRepoParams.platform,
    state.gitRepoParams.apiBase,
  );

  // Handle folder URL parsing for Git repo
  const handleGitRepoFolderUrlChange = (url: string) => {
    const parsed = gitRepo.parseUrl(
      url,
      state.gitRepoParams.platform,
      state.gitRepoParams.apiBase,
    );
    if (parsed) {
      setState((s) => ({
        ...s,
        gitRepoParams: {
          ...s.gitRepoParams,
          folderUrl: url,
          platform: parsed.platform,
          owner: parsed.owner,
          repo: parsed.repo,
          branch: parsed.branch || "main",
          path: parsed.path || "",
          apiBase: parsed.apiBase || s.gitRepoParams.apiBase || "",
          apiBaseValid: true,
          urlValid: true,
        },
      }));
    } else {
      setState((s) => ({
        ...s,
        gitRepoParams: {
          ...s.gitRepoParams,
          folderUrl: url,
          urlValid: false,
        },
      }));
    }
  };

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
              value={state.backendId}
              onChange={(e) => {
                const { value } = e.currentTarget;
                setState((s) => ({
                  ...s,
                  backendId: value as SyncBackendId,
                }));
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
              <SelectOption value="gitRepo">
                {translate(messageNames.gitRepo.sync)}
              </SelectOption>
              {(process.env.BROWSER === "chrome" ||
                (process.env.BROWSER === "firefox" && os !== "android")) && (
                <SelectOption value="browserSync">
                  {translate(messageNames.browserSync.sync)}
                </SelectOption>
              )}
            </Select>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Text>
              {translate(messageNames[state.backendId].syncDescription)}
            </Text>
          </RowItem>
        </Row>
        {state.backendId === "gitRepo" ? (
          <>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-gitrepo-folder-url`}>
                    {translate("clouds_gitRepoFolderUrlLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-gitrepo-folder-url`}
                  placeholder={translate("clouds_gitRepoFolderUrlPlaceholder")}
                  type="url"
                  value={state.gitRepoParams.folderUrl}
                  onChange={(e) => {
                    handleGitRepoFolderUrlChange(e.currentTarget.value);
                  }}
                />
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-gitrepo-platform`}>
                    {translate("clouds_gitRepoPlatformLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Select
                  className={fullWidthSelectClassName}
                  disabled={state.phase !== "none"}
                  id={`${id}-gitrepo-platform`}
                  value={state.gitRepoParams.platform}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      gitRepoParams: {
                        ...s.gitRepoParams,
                        platform: value as GitRepoPlatform,
                      },
                    }));
                  }}
                >
                  {gitRepo.getPlatforms().map((p) => (
                    <SelectOption key={p.id} value={p.id}>
                      {p.name}
                    </SelectOption>
                  ))}
                </Select>
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-gitrepo-owner`}>
                    {translate("clouds_gitRepoOwnerLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-gitrepo-owner`}
                  value={state.gitRepoParams.owner}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      gitRepoParams: { ...s.gitRepoParams, owner: value },
                    }));
                  }}
                />
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-gitrepo-repo`}>
                    {translate("clouds_gitRepoRepoLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-gitrepo-repo`}
                  value={state.gitRepoParams.repo}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      gitRepoParams: { ...s.gitRepoParams, repo: value },
                    }));
                  }}
                />
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-gitrepo-branch`}>
                    {translate("clouds_gitRepoBranchLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-gitrepo-branch`}
                  placeholder="main"
                  value={state.gitRepoParams.branch}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      gitRepoParams: { ...s.gitRepoParams, branch: value },
                    }));
                  }}
                />
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-gitrepo-path`}>
                    {translate("clouds_gitRepoPathLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-gitrepo-path`}
                  value={state.gitRepoParams.path}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      gitRepoParams: { ...s.gitRepoParams, path: value },
                    }));
                  }}
                />
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-gitrepo-token`}>
                    {translate("clouds_gitRepoTokenLabel")}
                    {" ("}
                    <Link href={gitRepoPatLink}>link</Link>
                    {")"}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-gitrepo-token`}
                  type="password"
                  value={state.gitRepoParams.token}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      gitRepoParams: { ...s.gitRepoParams, token: value },
                    }));
                  }}
                />
              </RowItem>
            </Row>
            {state.gitRepoParams.platform === "gitea" && (
              <Row>
                <RowItem expanded>
                  <LabelWrapper fullWidth>
                    <ControlLabel for={`${id}-gitrepo-apibase`}>
                      {translate("clouds_gitRepoApiBaseLabel")}
                    </ControlLabel>
                    <SubLabel>
                      {translate("clouds_gitRepoApiBaseRequired")}
                    </SubLabel>
                  </LabelWrapper>
                  <Input
                    disabled={state.phase !== "none"}
                    id={`${id}-gitrepo-apibase`}
                    placeholder="https://gitea.example.com"
                    type="url"
                    value={state.gitRepoParams.apiBase}
                    onChange={(e) => {
                      const {
                        value,
                        validity: { valid },
                      } = e.currentTarget;
                      setState((s) => ({
                        ...s,
                        gitRepoParams: {
                          ...s.gitRepoParams,
                          apiBase: value,
                          apiBaseValid: valid,
                        },
                      }));
                    }}
                  />
                </RowItem>
              </Row>
            )}
            {state.gitRepoParams.platform === "gitlab" && (
              <Row>
                <RowItem expanded>
                  <LabelWrapper fullWidth>
                    <ControlLabel for={`${id}-gitrepo-apibase`}>
                      {translate("clouds_gitRepoApiBaseLabel")}
                    </ControlLabel>
                    <SubLabel>
                      {translate("clouds_gitRepoApiBaseOptionalGitLab")}
                    </SubLabel>
                  </LabelWrapper>
                  <Input
                    disabled={state.phase !== "none"}
                    id={`${id}-gitrepo-apibase`}
                    placeholder="https://gitlab.com"
                    type="url"
                    value={state.gitRepoParams.apiBase}
                    onChange={(e) => {
                      const {
                        value,
                        validity: { valid },
                      } = e.currentTarget;
                      setState((s) => ({
                        ...s,
                        gitRepoParams: {
                          ...s.gitRepoParams,
                          apiBase: value,
                          apiBaseValid: valid,
                        },
                      }));
                    }}
                  />
                </RowItem>
              </Row>
            )}
          </>
        ) : state.backendId === "webdav" ? (
          <>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-webdav-url`}>
                    {translate("clouds_webdavUrlLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-webdav-url`}
                  pattern="https?:.*"
                  placeholder="https://example.com/webdav"
                  type="url"
                  value={state.webDAVParams.url}
                  onChange={(e) => {
                    const {
                      value,
                      validity: { valid },
                    } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      webDAVParams: {
                        ...s.webDAVParams,
                        url: value,
                        urlValid: valid,
                      },
                    }));
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
                  disabled={state.phase !== "none"}
                  id={`${id}-webdav-username`}
                  value={state.webDAVParams.username}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      webDAVParams: { ...s.webDAVParams, username: value },
                    }));
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
                  disabled={state.phase !== "none"}
                  id={`${id}-webdav-password`}
                  type="password"
                  value={state.webDAVParams.password}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      webDAVParams: { ...s.webDAVParams, password: value },
                    }));
                  }}
                />
              </RowItem>
            </Row>
            <Row>
              <RowItem expanded>
                <LabelWrapper fullWidth>
                  <ControlLabel for={`${id}-webdav-path`}>
                    {translate("clouds_webdavPathLabel")}
                  </ControlLabel>
                </LabelWrapper>
                <Input
                  disabled={state.phase !== "none"}
                  id={`${id}-webdav-path`}
                  placeholder="/Apps/uBlacklist"
                  value={state.webDAVParams.path}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    setState((s) => ({
                      ...s,
                      webDAVParams: { ...s.webDAVParams, path: value },
                    }));
                  }}
                />
              </RowItem>
            </Row>
          </>
        ) : state.backendId === "browserSync" ? null : (
          <>
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
            {(state.phase === "auth-alt" || state.phase === "conn-alt") && (
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
                    className={
                      state.phase === "auth-alt" ? FOCUS_START_CLASS : ""
                    }
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
            )}
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <Row>
          <RowItem expanded>
            {state.errorMessage && (
              <Text>{translate("error", state.errorMessage)}</Text>
            )}
          </RowItem>
          <RowItem>
            <Button
              className={
                state.phase === "auth" ||
                state.phase === "conn" ||
                state.phase === "conn-alt"
                  ? `${FOCUS_START_CLASS} ${FOCUS_END_CLASS}`
                  : okButtonEnabled
                    ? ""
                    : FOCUS_END_CLASS
              }
              onClick={close}
            >
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              className={okButtonEnabled ? FOCUS_END_CLASS : ""}
              disabled={!okButtonEnabled}
              primary
              onClick={() => {
                void (async () => {
                  if (state.backendId === "webdav") {
                    // state.phase === "none"
                    try {
                      const origins = [
                        new AltURL(state.webDAVParams.url).toString(),
                      ];
                      const granted = await browser.permissions.request({
                        origins,
                      });
                      if (!granted) {
                        return;
                      }
                    } catch {
                      return;
                    }
                    setState((s) => ({ ...s, phase: "conn" }));
                    try {
                      const error = await sendMessage(
                        "connect-to-webdav",
                        omit(state.webDAVParams, ["urlValid"]),
                      );
                      if (error) {
                        setState((s) => ({
                          ...s,
                          errorMessage: error.message,
                        }));
                        return;
                      }
                    } catch {
                      return;
                    } finally {
                      setState((s) => ({ ...s, phase: "none" }));
                    }
                    setBackendId("webdav");
                    close();
                    return;
                  }
                  if (state.backendId === "browserSync") {
                    try {
                      const error = await sendMessage(
                        "connect-to-browser-sync",
                      );
                      if (error) {
                        setState((s) => ({
                          ...s,
                          errorMessage: error.message,
                        }));
                        return;
                      }
                    } catch {
                      return;
                    }
                    setBackendId("browserSync");
                    close();
                    return;
                  }
                  if (state.backendId === "gitRepo") {
                    // Determine the API base URL for permission request
                    // For Gitea, apiBase is required and already validated
                    const apiBase =
                      state.gitRepoParams.apiBase ||
                      (state.gitRepoParams.platform === "github"
                        ? "https://api.github.com"
                        : state.gitRepoParams.platform === "gitlab"
                          ? "https://gitlab.com"
                          : state.gitRepoParams.platform === "codeberg"
                            ? "https://codeberg.org"
                            : "");
                    // For Gitea, apiBase must be provided (validated by okButtonEnabled)
                    if (!apiBase && state.gitRepoParams.platform === "gitea") {
                      setState((s) => ({
                        ...s,
                        errorMessage: "API Base URL is required for Gitea",
                      }));
                      return;
                    }
                    if (apiBase) {
                      try {
                        const url = new AltURL(apiBase);
                        const origins = [`${url.scheme}://${url.host}/*`];
                        const granted = await browser.permissions.request({
                          origins,
                        });
                        if (!granted) {
                          return;
                        }
                      } catch {
                        return;
                      }
                    }
                    setState((s) => ({ ...s, phase: "conn" }));
                    try {
                      const error = await sendMessage("connect-to-git-repo", {
                        platform: state.gitRepoParams.platform,
                        owner: state.gitRepoParams.owner,
                        repo: state.gitRepoParams.repo,
                        branch: state.gitRepoParams.branch || "main",
                        path: state.gitRepoParams.path,
                        token: state.gitRepoParams.token,
                        ...(state.gitRepoParams.apiBase
                          ? { apiBase: state.gitRepoParams.apiBase }
                          : {}),
                      });
                      if (error) {
                        setState((s) => ({
                          ...s,
                          errorMessage: error.message,
                        }));
                        return;
                      }
                    } catch {
                      return;
                    } finally {
                      setState((s) => ({ ...s, phase: "none" }));
                    }
                    setBackendId("gitRepo");
                    close();
                    return;
                  }
                  // OAuth-based clouds (Google Drive, Dropbox)
                  if (
                    state.backendId !== "googleDrive" &&
                    state.backendId !== "dropbox"
                  ) {
                    return;
                  }
                  const selectedCloud = supportedClouds[state.backendId];
                  let useAltFlow: boolean;
                  let authCode: string;
                  if (state.phase === "auth-alt") {
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
                        return;
                      }
                      authCode = (await selectedCloud.authorize(useAltFlow))
                        .authorizationCode;
                    } catch {
                      setState((s) => ({ ...s, phase: "none" }));
                      return;
                    }
                  }
                  setState((s) => ({
                    ...s,
                    phase: useAltFlow ? "conn-alt" : "conn",
                  }));
                  try {
                    const error = await sendMessage(
                      "connect-to-cloud",
                      state.backendId,
                      authCode,
                      useAltFlow,
                    );
                    if (error) {
                      setState((s) => ({ ...s, errorMessage: error.message }));
                      return;
                    }
                  } catch {
                    return;
                  } finally {
                    setState((s) => ({ ...s, phase: "none" }));
                  }
                  setBackendId(state.backendId);
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
  backendId: SyncBackendId | false | null;
  setBackendId: (id: SyncBackendId | false | null) => void;
}> = ({ backendId, setBackendId }) => {
  const id = useId();
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
                setBackendId(false);
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
          setBackendId={setBackendId}
        />
      </Portal>
    </SectionItem>
  );
};

const SyncNow: React.FC<{ backendId: SyncBackendId | false | null }> = (
  props,
) => {
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
          if (id !== props.backendId) {
            return;
          }
          setUpdated(false);
          setSyncing(true);
        },
        synced: (id, result, updated) => {
          if (id !== props.backendId) {
            return;
          }
          setSyncResult(result);
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
    initialItems: { syncCloudId: initialBackendId },
  } = useOptionsContext();
  const [backendId, setBackendId] = useState(initialBackendId);
  return (
    <Section aria-labelledby={`${id}-title`} id={props.id}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
          {translate("options_syncTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <TurnOnSync backendId={backendId} setBackendId={setBackendId} />
        <SyncNow backendId={backendId} />
        <SyncCategories disabled={!backendId} />
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

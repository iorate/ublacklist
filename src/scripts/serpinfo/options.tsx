import deleteSVG from "@mdi/svg/svg/delete.svg";
import eyeSVG from "@mdi/svg/svg/eye.svg";
import homeSVG from "@mdi/svg/svg/home.svg";
import dayjs from "dayjs";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { browser } from "../browser.ts";
import { Baseline } from "../components/baseline.tsx";
import { Button, LinkButton } from "../components/button.tsx";
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from "../components/constants.ts";
import { Container } from "../components/container.tsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  type DialogProps,
  DialogTitle,
} from "../components/dialog.tsx";
import { Input } from "../components/input.tsx";
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
import { Switch } from "../components/switch.tsx";
import { AutoThemeProvider } from "../components/theme.tsx";
import { useClassName } from "../components/utilities.ts";
import "../dayjs-locales.ts";
import dayjsLocalizedFormat from "dayjs/plugin/localizedFormat";
import { IconButton } from "../components/icon-button.tsx";
import { translate } from "../locales.ts";
import { postMessage, sendMessage } from "../messages.ts";
import { svgToDataURL } from "../utilities.ts";
import { GOOGLE_SERPINFO_URL } from "./builtins.ts";
import { ALLOWED_ORIGINS } from "./constants.ts";
import { Editor } from "./editor.tsx";
import { EnableSubscriptionURL } from "./enable-subscription-url.tsx";
import { parse } from "./parse.ts";
import type { RemoteSerpInfo, UserSerpInfo } from "./settings.ts";
import { storageStore } from "./storage-store.ts";
import type { SerpInfo } from "./types.ts";

dayjs.extend(dayjsLocalizedFormat);

function BasicSettingsSection() {
  const enabled = storageStore.use.serpInfoEnabled();
  const settings = storageStore.use.serpInfoSettings();
  const [hostPermissionsRequired, setHostPermissionsRequired] = useState(false);
  useEffect(() => {
    const hostPermissions = collectHostPermissions(
      settings.user,
      settings.remote,
    );
    if (hostPermissions.length) {
      browser.permissions
        .contains({ origins: hostPermissions })
        .then((granted) => {
          setHostPermissionsRequired(!granted);
        });
    } else {
      setHostPermissionsRequired(false);
    }
  }, [settings]);
  return (
    <Section aria-labelledby="basicSettingsSectionTitle">
      <SectionHeader>
        <SectionTitle id="basicSettingsSectionTitle">
          {translate("options_serpInfoBasicSettingsSection")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <ControlLabel for="enableSerpInfo">
                  {translate("options_enableSerpInfo")}
                </ControlLabel>
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Switch
                checked={enabled}
                id="enableSerpInfo"
                onChange={(e) => {
                  const value = e.currentTarget.checked;
                  storageStore.set({ serpInfoEnabled: value });
                  if (value) {
                    postMessage("update-all-remote-serpinfo");
                  }
                }}
              />
            </RowItem>
          </Row>
        </SectionItem>
        <EnableSubscriptionURL type="serpinfo" />
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <Label>{translate("options_accessPermissionLabel")}</Label>
                <SubLabel>
                  {translate("options_accessPermissionDescription")}
                </SubLabel>
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Button
                disabled={!hostPermissionsRequired}
                primary
                onClick={() => {
                  const hostPermissions = collectHostPermissions(
                    settings.user,
                    settings.remote,
                  );
                  if (hostPermissions.length) {
                    browser.permissions
                      .request({ origins: hostPermissions })
                      .then((granted) => {
                        if (granted) {
                          setHostPermissionsRequired(false);
                        }
                      });
                  }
                }}
              >
                {translate("options_accessPermissionButton")}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
      </SectionBody>
    </Section>
  );
}

function collectHostPermissions(
  user: UserSerpInfo,
  remote: readonly RemoteSerpInfo[],
): string[] {
  const hostPermissions = [];
  if (user.parsed) {
    hostPermissions.push(...collectMatches(user.parsed));
  }
  for (const r of remote) {
    if (r.enabled) {
      try {
        if (!ALLOWED_ORIGINS.includes(new URL(r.url).origin)) {
          hostPermissions.push(r.url);
        }
      } catch {
        // Ignore invalid URLs
      }
      // No need to request permission for builtin Google SERPINFO
      if (r.url !== GOOGLE_SERPINFO_URL && r.parsed) {
        hostPermissions.push(...collectMatches(r.parsed));
      }
    }
  }
  return hostPermissions;
}

function collectMatches(serpInfo: SerpInfo): string[] {
  return serpInfo.pages.flatMap((page) =>
    page.matches.map((match) => (match === "<all_urls>" ? "*://*/*" : match)),
  );
}

function RemoteSerpInfoSection() {
  const settings = storageStore.use.serpInfoSettings();
  const [addDialogProps, setAddDialogProps] = useState<{
    initialURL: string;
  } | null>(null);
  const [showDialogProps, setShowDialogProps] = useState<{
    remote: RemoteSerpInfo;
  } | null>(null);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    const here = new URL(location.href);
    const url = here.searchParams.get("url");
    if (url != null) {
      setAddDialogProps({ initialURL: url });
    }
    history.replaceState(null, "", here.pathname);
    return () => history.replaceState(null, "", here);
  }, []);
  return (
    <Section aria-labelledby="remoteSerpInfoSectionTitle">
      <SectionHeader>
        <SectionTitle id="remoteSerpInfoSectionTitle">
          {translate("options_remoteSerpInfoSection")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <List>
                {settings.remote.map((r) => {
                  const { name, description, version, lastModified, homepage } =
                    r.parsed || { name: r.url };
                  const error = r.parseError || r.downloadError;
                  return (
                    <ListItem key={r.url}>
                      <Row>
                        <RowItem expanded>
                          <LabelWrapper>
                            <Label>{name}</Label>
                            {description && <SubLabel>{description}</SubLabel>}
                            {version && (
                              <SubLabel>
                                {`${translate("options_remoteSerpInfoVersion")}: ${version}`}
                              </SubLabel>
                            )}
                            {lastModified && (
                              <SubLabel>
                                {`${translate("options_remoteSerpInfoLastModified")}: ${dayjs(
                                  lastModified,
                                )
                                  .locale(translate("lang"))
                                  .format("LL")}`}
                              </SubLabel>
                            )}
                            {error && (
                              <SubLabel>{translate("error", error)}</SubLabel>
                            )}
                          </LabelWrapper>
                        </RowItem>
                        <RowItem>
                          <IconButton
                            aria-label={translate(
                              "options_remoteSerpInfoHomepage",
                            )}
                            disabled={homepage == null}
                            iconURL={svgToDataURL(homeSVG)}
                            onClick={() => {
                              if (homepage == null) {
                                return;
                              }
                              void browser.tabs.create({ url: homepage });
                            }}
                          />
                        </RowItem>
                        <RowItem>
                          <IconButton
                            aria-label={translate(
                              "options_showRemoteSerpInfoButton",
                            )}
                            iconURL={svgToDataURL(eyeSVG)}
                            onClick={() => {
                              setShowDialogProps({ remote: r });
                            }}
                          />
                        </RowItem>
                        <RowItem>
                          <IconButton
                            aria-label={translate(
                              "options_removeRemoteSerpInfoButton",
                            )}
                            disabled={!r.custom}
                            iconURL={svgToDataURL(deleteSVG)}
                            onClick={() => {
                              if (!r.custom) {
                                return;
                              }
                              postMessage("remove-remote-serpinfo", r.url);
                            }}
                          />
                        </RowItem>
                        <RowItem spacing="calc(0.625em + 6px)">
                          <Switch
                            checked={r.enabled}
                            id={r.url}
                            onChange={async (e) => {
                              const value = e.currentTarget.checked;
                              if (value && r.parsed) {
                                const origins = collectMatches(r.parsed);
                                if (
                                  origins.length &&
                                  !(await browser.permissions.request({
                                    origins,
                                  }))
                                ) {
                                  return;
                                }
                              }
                              postMessage(
                                "enable-remote-serpinfo",
                                r.url,
                                value,
                              );
                            }}
                          />
                        </RowItem>
                      </Row>
                    </ListItem>
                  );
                })}
              </List>
            </RowItem>
          </Row>
          <Row>
            <RowItem expanded>
              <LinkButton
                disabled={updating}
                onClick={async () => {
                  setUpdating(true);
                  try {
                    await sendMessage("update-all-remote-serpinfo");
                  } finally {
                    setUpdating(false);
                  }
                }}
              >
                {translate("options_updateAllRemoteSerpInfoButton")}
              </LinkButton>
            </RowItem>
            <RowItem>
              <Button
                onClick={() => {
                  setAddDialogProps({ initialURL: "" });
                }}
              >
                {translate("options_addRemoteSerpInfoButton")}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
      </SectionBody>
      <Portal id="addRemoteSerpInfoDialog">
        {addDialogProps && (
          <AddRemoteSerpInfoDialog
            open={true}
            close={() => {
              setAddDialogProps(null);
            }}
            initialURL={addDialogProps.initialURL}
          />
        )}
      </Portal>
      <Portal id="showRemoteSerpInfoDialog">
        {showDialogProps && (
          <ShowRemoteSerpInfoDialog
            open={true}
            close={() => {
              setShowDialogProps(null);
            }}
            remote={showDialogProps.remote}
          />
        )}
      </Portal>
    </Section>
  );
}

function AddRemoteSerpInfoDialog(props: DialogProps & { initialURL: string }) {
  const { initialURL, ...dialogProps } = props;
  const [url, setURL] = useState(initialURL);
  const [urlValid, setURLValid] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (urlInputRef.current) {
      setURLValid(urlInputRef.current.validity.valid);
    }
  }, []);
  const addable = urlValid;
  return (
    <Dialog aria-labelledby="addRemoteSerpInfoDialogTitle" {...dialogProps}>
      <DialogHeader>
        <DialogTitle id="addRemoteSerpInfoDialogTitle">
          {translate("options_addRemoteSerpInfoDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for="remoteSerpInfoURL">
                {translate("options_addRemoteSerpInfoDialog_urlLabel")}
              </ControlLabel>
            </LabelWrapper>
            <Input
              className={FOCUS_START_CLASS}
              id="remoteSerpInfoURL"
              pattern="https?:.*"
              ref={urlInputRef}
              required={true}
              type="url"
              value={url}
              onChange={(e) => {
                const {
                  value: url,
                  validity: { valid: urlValid },
                } = e.currentTarget;
                setURL(url);
                setURLValid(urlValid);
              }}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button
              className={!addable ? FOCUS_END_CLASS : ""}
              onClick={props.close}
            >
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              className={addable ? FOCUS_END_CLASS : ""}
              disabled={!addable}
              primary
              onClick={async () => {
                const origin = new URL(url).origin;
                if (
                  !ALLOWED_ORIGINS.includes(origin) &&
                  !(await browser.permissions.request({
                    origins: [`${origin}/*`],
                  }))
                ) {
                  return;
                }
                postMessage("add-remote-serpinfo", url);
                props.close();
              }}
            >
              {translate("options_addRemoteSerpInfoDialog_addButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
}

function ShowRemoteSerpInfoDialog(
  props: DialogProps & { remote: RemoteSerpInfo },
) {
  const { remote, ...dialogProps } = props;
  return (
    <Dialog
      aria-labelledby="showRemoteSerpInfoDialogTitle"
      width="600px"
      {...dialogProps}
    >
      <DialogHeader>
        <DialogTitle id="showRemoteSerpInfoDialogTitle">
          {remote.parsed?.name ?? remote.url}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <Editor
              height="max(200px, 100vh - 170px)"
              readOnly
              value={remote.content ?? ""}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button className={FOCUS_END_CLASS} primary onClick={props.close}>
              {translate("okButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
}

function UserSerpInfoSection() {
  const settings = storageStore.use.serpInfoSettings();
  const [userInput, setUserInput] = useState(settings.user.content);
  const [userInputDirty, setUserInputDirty] = useState(false);
  const [userSerpInfoError, setUserSerpInfoError] = useState<string | null>(
    null,
  );
  const errorClassName = useClassName(
    (theme) => ({
      color: theme.text.secondary,
      fontFamily:
        'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace',
      whiteSpace: "pre-wrap",
    }),
    [],
  );
  return (
    <Section aria-labelledby="userSerpInfoSectionTitle">
      <SectionHeader>
        <SectionTitle id="userSerpInfoSectionTitle">
          {translate("options_userSerpInfoSection")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <Editor
                height="300px"
                resizable
                value={userInput}
                onChange={(value) => {
                  setUserInput(value);
                  setUserInputDirty(true);
                }}
              />
            </RowItem>
          </Row>
          <Row>
            <RowItem expanded>
              <Link href="https://iorate.github.io/ublacklist/docs/serpinfo">
                {translate("options_userSerpInfoDocumentationLink")}
              </Link>
            </RowItem>
            <RowItem>
              <Button
                disabled={!userInputDirty}
                primary
                onClick={async () => {
                  const strictParseResult = parse(userInput, {
                    strict: true,
                    multilineError: true,
                  });
                  const parseResult = strictParseResult.success
                    ? strictParseResult
                    : parse(userInput);
                  if (parseResult.success) {
                    const origins = collectMatches(parseResult.data);
                    if (origins.length) {
                      await browser.permissions.request({ origins });
                    }
                  }
                  setUserInputDirty(false);
                  setUserSerpInfoError(
                    strictParseResult.success ? null : strictParseResult.error,
                  );
                  postMessage("set-user-serpinfo", userInput);
                }}
              >
                {translate("options_saveUserSerpInfo")}
              </Button>
            </RowItem>
          </Row>
          {userSerpInfoError && (
            <Row>
              <RowItem expanded>
                <pre className={errorClassName}>{userSerpInfoError}</pre>
              </RowItem>
            </Row>
          )}
        </SectionItem>
      </SectionBody>
    </Section>
  );
}

function OptionsImpl() {
  use(storageStore.attachPromise);
  return (
    <Container>
      <BasicSettingsSection />
      <RemoteSerpInfoSection />
      <UserSerpInfoSection />
    </Container>
  );
}

function Options() {
  return (
    <AutoThemeProvider>
      <Baseline>
        <Suspense fallback={null}>
          <OptionsImpl />
        </Suspense>
      </Baseline>
    </AutoThemeProvider>
  );
}

function main(): void {
  document.documentElement.lang = translate("lang");
  const root = createRoot(
    document.body.appendChild(document.createElement("div")),
  );
  root.render(<Options />);
}

main();

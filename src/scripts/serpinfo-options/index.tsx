import { Switch } from "@base-ui/react/switch";
import deleteSVG from "@mdi/svg/svg/delete.svg";
import eyeSVG from "@mdi/svg/svg/eye.svg";
import homeSVG from "@mdi/svg/svg/home.svg";
import { parse, type SerpInfo } from "@ublacklist/serpinfo";
import dayjs from "dayjs";
import dayjsLocalizedFormat from "dayjs/plugin/localizedFormat";
import "../components/theme.css";
import "../components/baseline.css";
import { Suspense, use, useEffect, useId, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, LinkButton } from "../components/button.tsx";
import { Container } from "../components/container.tsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog.tsx";
import { IconButton } from "../components/icon-button.tsx";
import { Input } from "../components/input.tsx";
import {
  ControlLabel,
  Label,
  LabelWrapper,
  SubLabel,
} from "../components/label.tsx";
import { Link } from "../components/link.tsx";
import { List, ListItem } from "../components/list.tsx";
import { Row, RowItem } from "../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../components/section.tsx";
import styles from "../components/switch.module.css";
import { Text } from "../components/text.tsx";
import { AutoThemeProvider } from "../components/theme.tsx";
import { useClassName } from "../components/utilities.ts";
import { browser } from "../shared/browser.ts";
import "../shared/dayjs-locales.ts";
import { GOOGLE_SERPINFO_URL } from "../shared/builtin-serpinfo.ts";
import { permissionExemptOrigins } from "../shared/constants.ts";
import { EnableSubscriptionURL } from "../shared/enable-subscription-url.tsx";
import { getWebsiteURL, translate } from "../shared/locales.ts";
import { postMessage, sendMessage } from "../shared/messages.ts";
import { requestPermission } from "../shared/permissions.ts";
import type {
  RemoteSerpInfo,
  UserSerpInfo,
} from "../shared/serpinfo-settings.ts";
import { storageStore } from "../shared/storage-store.ts";
import { svgToDataURL } from "../shared/utilities.ts";
import { Editor } from "./editor.tsx";

dayjs.extend(dayjsLocalizedFormat);

function BasicSettingsSection(props: { id: string }) {
  const id = useId();
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
    <Section id={props.id} aria-labelledby={`${id}-title`}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
          {translate("options_serpInfoBasicSettingsSection")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
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
        if (
          !(permissionExemptOrigins as readonly string[]).includes(
            new URL(r.url).origin,
          )
        ) {
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

function RemoteSerpInfoSection(props: { id: string }) {
  const id = useId();
  const settings = storageStore.use.serpInfoSettings();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addDialogInitialURLRef = useRef("");
  const [showDialogRemote, setShowDialogRemote] =
    useState<RemoteSerpInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "updating" | "done"
  >("idle");
  useEffect(() => {
    const here = new URL(location.href);
    const url = here.searchParams.get("url");
    if (url != null) {
      addDialogInitialURLRef.current = url;
      setAddDialogOpen(true);
    }
    history.replaceState(null, "", here.pathname);
    return () => history.replaceState(null, "", here);
  }, []);
  useEffect(() => {
    if (updateStatus === "done") {
      const timer = window.setTimeout(() => setUpdateStatus("idle"), 3000);
      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [updateStatus]);
  return (
    <Section id={props.id} aria-labelledby={`${id}-title`}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
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
                              setShowDialogRemote(r);
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
                          <Switch.Root
                            checked={r.enabled}
                            className={styles.switch}
                            id={r.url}
                            onCheckedChange={async (value) => {
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
                          >
                            <Switch.Thumb className={styles.thumb} />
                          </Switch.Root>
                        </RowItem>
                      </Row>
                    </ListItem>
                  );
                })}
              </List>
            </RowItem>
          </Row>
          <Row>
            <RowItem>
              <LinkButton
                disabled={updateStatus === "updating"}
                onClick={async () => {
                  setUpdateStatus("updating");
                  try {
                    await sendMessage("update-all-remote-serpinfo");
                    setUpdateStatus("done");
                  } catch {
                    setUpdateStatus("idle");
                  }
                }}
              >
                {translate("options_updateAllRemoteSerpInfoButton")}
              </LinkButton>
            </RowItem>
            <RowItem expanded>
              {updateStatus === "done" && (
                <Text>{translate("options_remoteSerpInfoUpdateDone")}</Text>
              )}
            </RowItem>
            <RowItem>
              <Button
                onClick={() => {
                  setAddDialogOpen(true);
                }}
              >
                {translate("options_addRemoteSerpInfoButton")}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
      </SectionBody>
      <AddRemoteSerpInfoDialog
        close={() => {
          setAddDialogOpen(false);
          addDialogInitialURLRef.current = "";
        }}
        initialURL={addDialogInitialURLRef.current}
        open={addDialogOpen}
      />
      <ShowRemoteSerpInfoDialog
        close={() => {
          setShowDialogRemote(null);
        }}
        open={showDialogRemote != null}
        remote={showDialogRemote}
      />
    </Section>
  );
}

function AddRemoteSerpInfoForm({
  close,
  initialURL,
}: {
  close: () => void;
  initialURL: string;
}) {
  const id = useId();
  const [url, setURL] = useState(initialURL);
  const [urlValid, setURLValid] = useState(() => {
    // pattern="https?:.*"
    // required
    if (!initialURL || !/^https?:/.test(initialURL)) {
      return false;
    }
    // type="url"
    try {
      new URL(initialURL);
    } catch {
      return false;
    }
    return true;
  });
  const addable = urlValid;
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {translate("options_addRemoteSerpInfoDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for={`${id}-url`}>
                {translate("options_addRemoteSerpInfoDialog_urlLabel")}
              </ControlLabel>
            </LabelWrapper>
            <Input
              id={`${id}-url`}
              pattern="https?:.*"
              required={true}
              type="url"
              value={url}
              onChange={(e) => {
                const {
                  value,
                  validity: { valid },
                } = e.currentTarget;
                setURL(value);
                setURLValid(valid);
              }}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button onClick={close}>{translate("cancelButton")}</Button>
          </RowItem>
          <RowItem>
            <Button
              disabled={!addable}
              primary
              onClick={async () => {
                if (!(await requestPermission([url]))) {
                  return;
                }
                postMessage("add-remote-serpinfo", url);
                close();
              }}
            >
              {translate("options_addRemoteSerpInfoDialog_addButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </>
  );
}

function AddRemoteSerpInfoDialog({
  close,
  initialURL,
  open,
}: {
  close: () => void;
  initialURL: string;
  open: boolean;
}) {
  return (
    <Dialog close={close} open={open}>
      <AddRemoteSerpInfoForm close={close} initialURL={initialURL} />
    </Dialog>
  );
}

function ShowRemoteSerpInfoDialog({
  close,
  open,
  remote,
}: {
  close: () => void;
  open: boolean;
  remote: RemoteSerpInfo | null;
}) {
  return (
    <Dialog close={close} open={open} width="600px">
      <DialogHeader>
        <DialogTitle>{remote?.parsed?.name ?? remote?.url}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <Editor
              height="max(200px, 100dvh - 170px)"
              readOnly
              value={remote?.content ?? ""}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button primary onClick={close}>
              {translate("okButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
}

function UserSerpInfoSection(props: { id: string }) {
  const id = useId();
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
    <Section id={props.id} aria-labelledby={`${id}-title`}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
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
              <Link href={getWebsiteURL("/docs/serpinfo")}>
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
      {/* biome-ignore-start lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
      <BasicSettingsSection id="basic-settings" />
      <RemoteSerpInfoSection id="remote-serpinfo" />
      <UserSerpInfoSection id="user-serpinfo" />
      {/* biome-ignore-end lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
    </Container>
  );
}

function Options() {
  return (
    <AutoThemeProvider>
      <Suspense fallback={null}>
        <OptionsImpl />
      </Suspense>
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

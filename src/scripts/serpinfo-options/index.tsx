import { Input } from "@base-ui/react/input";
import { Switch } from "@base-ui/react/switch";
import deleteSVG from "@mdi/svg/svg/delete.svg";
import eyeSVG from "@mdi/svg/svg/eye.svg";
import homeSVG from "@mdi/svg/svg/home.svg";
import { parse, type SerpInfo } from "@ublacklist/serpinfo";
import clsx from "clsx";
import dayjs from "dayjs";
import dayjsLocalizedFormat from "dayjs/plugin/localizedFormat";
import containerStyles from "../components/container.module.css";
import iconButtonStyles from "../components/icon-button.module.css";
import inputStyles from "../components/input.module.css";
import listStyles from "../components/list.module.css";
import rowStyles from "../components/row.module.css";
import sectionStyles from "../components/section.module.css";
import { SvgIcon } from "../components/svg-icon.tsx";
import textStyles from "../components/text.module.css";
import "../components/theme.css";
import "../components/baseline.css";
import { Button } from "@base-ui/react/button";
import type React from "react";
import { Suspense, use, useEffect, useId, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import buttonStyles from "../components/button.module.css";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog.tsx";
import labelStyles from "../components/label.module.css";
import { Link } from "../components/link.tsx";
import styles from "../components/switch.module.css";
import { AutoThemeProvider } from "../components/theme.tsx";
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
import { Editor } from "./editor.tsx";
import pageStyles from "./index.module.css";

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
    <section
      className={sectionStyles.section}
      id={props.id}
      aria-labelledby={`${id}-title`}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_serpInfoBasicSettingsSection")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <EnableSubscriptionURL type="serpinfo" />
        <div className={sectionStyles.item}>
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <div className={labelStyles.wrapper}>
                <div className={labelStyles.label}>
                  {translate("options_accessPermissionLabel")}
                </div>
                <div className={labelStyles.subLabel}>
                  {translate("options_accessPermissionDescription")}
                </div>
              </div>
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.primary)}
                disabled={!hostPermissionsRequired}
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
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <section
      className={sectionStyles.section}
      id={props.id}
      aria-labelledby={`${id}-title`}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_remoteSerpInfoSection")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <div className={sectionStyles.item}>
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <ul className={listStyles.list}>
                {settings.remote.map((r) => {
                  const { name, description, version, lastModified, homepage } =
                    r.parsed || { name: r.url };
                  const error = r.parseError || r.downloadError;
                  return (
                    <li className={listStyles.item} key={r.url}>
                      <div className={rowStyles.row}>
                        <div
                          className={clsx(
                            rowStyles.rowItem,
                            rowStyles.expanded,
                          )}
                        >
                          <div className={labelStyles.wrapper}>
                            <div className={labelStyles.label}>{name}</div>
                            {description && (
                              <div className={labelStyles.subLabel}>
                                {description}
                              </div>
                            )}
                            {version && (
                              <div className={labelStyles.subLabel}>
                                {`${translate("options_remoteSerpInfoVersion")}: ${version}`}
                              </div>
                            )}
                            {lastModified && (
                              <div className={labelStyles.subLabel}>
                                {`${translate("options_remoteSerpInfoLastModified")}: ${dayjs(
                                  lastModified,
                                )
                                  .locale(translate("lang"))
                                  .format("LL")}`}
                              </div>
                            )}
                            {error && (
                              <div className={labelStyles.subLabel}>
                                {translate("error", error)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={rowStyles.rowItem}>
                          <button
                            className={iconButtonStyles.button}
                            type="button"
                            aria-label={translate(
                              "options_remoteSerpInfoHomepage",
                            )}
                            disabled={homepage == null}
                            onClick={() => {
                              if (homepage == null) {
                                return;
                              }
                              void browser.tabs.create({ url: homepage });
                            }}
                          >
                            <SvgIcon
                              color="var(--ub-color-text-secondary)"
                              svg={homeSVG}
                            />
                          </button>
                        </div>
                        <div className={rowStyles.rowItem}>
                          <button
                            className={iconButtonStyles.button}
                            type="button"
                            aria-label={translate(
                              "options_showRemoteSerpInfoButton",
                            )}
                            onClick={() => {
                              setShowDialogRemote(r);
                            }}
                          >
                            <SvgIcon
                              color="var(--ub-color-text-secondary)"
                              svg={eyeSVG}
                            />
                          </button>
                        </div>
                        <div className={rowStyles.rowItem}>
                          <button
                            className={iconButtonStyles.button}
                            type="button"
                            aria-label={translate(
                              "options_removeRemoteSerpInfoButton",
                            )}
                            disabled={!r.custom}
                            onClick={() => {
                              if (!r.custom) {
                                return;
                              }
                              postMessage("remove-remote-serpinfo", r.url);
                            }}
                          >
                            <SvgIcon
                              color="var(--ub-color-text-secondary)"
                              svg={deleteSVG}
                            />
                          </button>
                        </div>
                        <div
                          className={rowStyles.rowItem}
                          style={
                            {
                              "--ub-row-item-spacing": "calc(0.625em + 6px)",
                            } as React.CSSProperties
                          }
                        >
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
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className={rowStyles.row}>
            <div className={rowStyles.rowItem}>
              <Button
                className={buttonStyles.linkButton}
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
              </Button>
            </div>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              {updateStatus === "done" && (
                <span className={textStyles.secondary}>
                  {translate("options_remoteSerpInfoUpdateDone")}
                </span>
              )}
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.secondary)}
                onClick={() => {
                  setAddDialogOpen(true);
                }}
              >
                {translate("options_addRemoteSerpInfoButton")}
              </Button>
            </div>
          </div>
        </div>
      </div>
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
    </section>
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
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {translate("options_addRemoteSerpInfoDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
              <label className={labelStyles.controlLabel} htmlFor={`${id}-url`}>
                {translate("options_addRemoteSerpInfoDialog_urlLabel")}
              </label>
            </div>
            <Input
              className={inputStyles.input}
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
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className={clsx(rowStyles.row, rowStyles.right)}>
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
              disabled={!urlValid}
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
          </div>
        </div>
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
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <Editor
              height="max(200px, 100dvh - 170px)"
              readOnly
              value={remote?.content ?? ""}
            />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className={clsx(rowStyles.row, rowStyles.right)}>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.primary)}
              onClick={close}
            >
              {translate("okButton")}
            </Button>
          </div>
        </div>
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
  return (
    <section
      className={sectionStyles.section}
      id={props.id}
      aria-labelledby={`${id}-title`}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_userSerpInfoSection")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <div className={sectionStyles.item}>
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <Editor
                height="300px"
                resizable
                value={userInput}
                onChange={(value) => {
                  setUserInput(value);
                  setUserInputDirty(true);
                }}
              />
            </div>
          </div>
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <Link href={getWebsiteURL("/docs/serpinfo")}>
                {translate("options_userSerpInfoDocumentationLink")}
              </Link>
            </div>
            <div className={rowStyles.rowItem}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.primary)}
                disabled={!userInputDirty}
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
            </div>
          </div>
          {userSerpInfoError && (
            <div className={rowStyles.row}>
              <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
                <pre className={pageStyles.error}>{userSerpInfoError}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function OptionsImpl() {
  use(storageStore.attachPromise);
  return (
    <div className={containerStyles.wrapper}>
      <div className={containerStyles.container}>
        {/* biome-ignore-start lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
        <BasicSettingsSection id="basic-settings" />
        <RemoteSerpInfoSection id="remote-serpinfo" />
        <UserSerpInfoSection id="user-serpinfo" />
        {/* biome-ignore-end lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
      </div>
    </div>
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

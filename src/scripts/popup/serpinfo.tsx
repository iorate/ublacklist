import { Button } from "@base-ui/react/button";
import { Switch } from "@base-ui/react/switch";
import cog from "@mdi/svg/svg/cog.svg";
import clsx from "clsx";
import { useId, useRef, useState } from "react";
import icon from "../../icons/icon.svg";
import { EmbeddedDialog } from "../components/embedded-dialog.tsx";
import { SvgIcon } from "../components/svg-icon.tsx";
import { browser } from "../shared/browser.ts";
import { loadFromLocalStorage } from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { sendMessage, sendMessageToTab } from "../shared/messages.ts";
import { serpMatchesUrl } from "../shared/serpinfo-match.ts";
import buttonStyles from "../styles/button.module.css";
import dialogStyles from "../styles/dialog.module.css";
import iconButtonStyles from "../styles/icon-button.module.css";
import labelStyles from "../styles/label.module.css";
import rowStyles from "../styles/row.module.css";
import switchStyles from "../styles/switch.module.css";

async function openOptionsPage(): Promise<void> {
  await sendMessage("open-options-page");
  // https://github.com/iorate/ublacklist/issues/378
  if (process.env.BROWSER === "firefox") {
    window.close();
  }
}

export function SerpInfoEmbeddedDialog({
  tabId,
  initialHideBlockedResults,
}: {
  tabId: number;
  initialHideBlockedResults: boolean;
}): React.ReactNode {
  const id = useId();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const [hideBlockedResults, setHideBlockedResults] = useState(
    initialHideBlockedResults,
  );
  return (
    <EmbeddedDialog
      aria-labelledby={`${id}-title`}
      close={() => window.close()}
      initialFocus={initialFocusRef}
    >
      <div className={dialogStyles.header}>
        <h2 className={dialogStyles.title} id={`${id}-title`}>
          <div className={rowStyles.row}>
            <div className={rowStyles.rowItem}>
              <SvgIcon svg={icon} />
            </div>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              {translate("popup_active")}
            </div>
          </div>
        </h2>
      </div>
      <div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={labelStyles.wrapper}>
              <label
                className={labelStyles.controlLabel}
                htmlFor={`${id}-switch`}
              >
                {translate("popup_serpInfoMode_showBlockedResults")}
              </label>
            </div>
          </div>
          <div className={rowStyles.rowItem}>
            <Switch.Root
              checked={!hideBlockedResults}
              className={switchStyles.switch}
              id={`${id}-switch`}
              onCheckedChange={(checked) => {
                const hideBlockedResults = !checked;
                setHideBlockedResults(hideBlockedResults);
                sendMessageToTab(
                  tabId,
                  "set-hide-blocked-results",
                  hideBlockedResults,
                ).catch((error) => {
                  console.error(error);
                });
              }}
            >
              <Switch.Thumb className={switchStyles.thumb} />
            </Switch.Root>
          </div>
        </div>
      </div>
      <div className={dialogStyles.footer}>
        <div
          className={clsx(rowStyles.row, rowStyles.multiline, rowStyles.right)}
        >
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <button
              aria-label={translate("popup_openOptionsLink")}
              className={iconButtonStyles.button}
              title={translate("popup_openOptionsLink")}
              type="button"
              onClick={() => {
                void openOptionsPage();
              }}
            >
              <SvgIcon color="var(--ub-color-text-secondary)" svg={cog} />
            </button>
          </div>
          <div className={rowStyles.rowItem}>
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <Button
                  className={clsx(buttonStyles.button, buttonStyles.primary)}
                  ref={initialFocusRef}
                  onClick={() => window.close()}
                >
                  {translate("okButton")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmbeddedDialog>
  );
}

export async function canEnableSerpInfo(
  url: string,
  mobile: boolean,
): Promise<boolean> {
  const { serpInfoSettings } = await loadFromLocalStorage(["serpInfoSettings"]);
  const pages = [
    ...(serpInfoSettings.user.parsed?.pages ?? []),
    ...serpInfoSettings.remote.flatMap((remote) => remote.parsed?.pages ?? []),
  ];
  return pages.some((serp) => serpMatchesUrl(serp, url, mobile));
}

export function EnableSerpInfoEmbeddedDialog() {
  const id = useId();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  return (
    <EmbeddedDialog
      aria-labelledby={`${id}-title`}
      close={() => window.close()}
      initialFocus={initialFocusRef}
    >
      <div className={dialogStyles.header}>
        <h2 className={dialogStyles.title} id={`${id}-title`}>
          <div className={rowStyles.row}>
            <div className={rowStyles.rowItem}>
              <SvgIcon svg={icon} />
            </div>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              {translate("popup_serpInfoMode_available")}
            </div>
          </div>
        </h2>
      </div>
      <div className={dialogStyles.footer}>
        <div
          className={clsx(rowStyles.row, rowStyles.multiline, rowStyles.right)}
        >
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <button
              aria-label={translate("popup_openOptionsLink")}
              className={iconButtonStyles.button}
              title={translate("popup_openOptionsLink")}
              type="button"
              onClick={() => {
                void openOptionsPage();
              }}
            >
              <SvgIcon color="var(--ub-color-text-secondary)" svg={cog} />
            </button>
          </div>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.secondary)}
              onClick={() => window.close()}
            >
              {translate("cancelButton")}
            </Button>
          </div>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.primary)}
              ref={initialFocusRef}
              onClick={async () => {
                await browser.tabs.create({
                  url: "/pages/serpinfo-options.html",
                });
                window.close();
              }}
            >
              {translate("popup_serpInfoMode_setupButton")}
            </Button>
          </div>
        </div>
      </div>
    </EmbeddedDialog>
  );
}

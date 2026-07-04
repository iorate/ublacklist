import { Switch } from "@base-ui/react/switch";
import cog from "@mdi/svg/svg/cog.svg";
import { MatchPattern } from "@ublacklist/match-pattern";
import { useId, useState } from "react";
import icon from "../../icons/icon.svg";
import {
  FOCUS_DEFAULT_CLASS,
  FOCUS_END_CLASS,
  FOCUS_START_CLASS,
} from "../components/constants.ts";
import { Button } from "../components/legacy/button.tsx";
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmbeddedDialog,
} from "../components/legacy/dialog.tsx";
import { Icon } from "../components/legacy/icon.tsx";
import { IconButton } from "../components/legacy/icon-button.tsx";
import { ControlLabel, LabelWrapper } from "../components/legacy/label.tsx";
import { Row, RowItem } from "../components/legacy/row.tsx";
import styles from "../components/switch.module.css";
import { browser } from "../shared/browser.ts";
import { loadFromLocalStorage } from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { sendMessage, sendMessageToTab } from "../shared/messages.ts";
import { svgToDataURL } from "../shared/utilities.ts";

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
  const [hideBlockedResults, setHideBlockedResults] = useState(
    initialHideBlockedResults,
  );
  return (
    <EmbeddedDialog close={() => window.close()} width="360px">
      <DialogHeader>
        <DialogTitle id={`${id}-title`}>
          <Row>
            <RowItem>
              <Icon iconSize="24px" url={svgToDataURL(icon)} />
            </RowItem>
            <RowItem expanded>{translate("popup_active")}</RowItem>
          </Row>
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper>
              <ControlLabel for={`${id}-switch`}>
                {translate("popup_serpInfoMode_showBlockedResults")}
              </ControlLabel>
            </LabelWrapper>
          </RowItem>
          <RowItem>
            <Switch.Root
              checked={!hideBlockedResults}
              className={`${styles.switch} ${FOCUS_START_CLASS}`}
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
              <Switch.Thumb className={styles.thumb} />
            </Switch.Root>
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row multiline right>
          <RowItem expanded>
            <IconButton
              aria-label={translate("popup_openOptionsLink")}
              iconURL={svgToDataURL(cog)}
              title={translate("popup_openOptionsLink")}
              onClick={() => {
                void openOptionsPage();
              }}
            />
          </RowItem>
          <RowItem>
            <Row>
              <RowItem>
                <Button
                  className={`${FOCUS_END_CLASS} ${FOCUS_DEFAULT_CLASS}`}
                  primary
                  onClick={() => window.close()}
                >
                  {translate("okButton")}
                </Button>
              </RowItem>
            </Row>
          </RowItem>
        </Row>
      </DialogFooter>
    </EmbeddedDialog>
  );
}

function matches(url: string, patterns: readonly string[]): boolean {
  return new MatchPattern(patterns).test(url);
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
  return pages.some(
    (serp) =>
      matches(url, serp.matches) &&
      !(serp.excludeMatches && matches(url, serp.excludeMatches)) &&
      !(serp.includeRegex && !new RegExp(serp.includeRegex).test(url)) &&
      !(serp.excludeRegex && new RegExp(serp.excludeRegex).test(url)) &&
      !(serp.userAgent === "desktop" && mobile) &&
      !(serp.userAgent === "mobile" && !mobile),
  );
}

export function EnableSerpInfoEmbeddedDialog() {
  const id = useId();
  return (
    <EmbeddedDialog close={() => window.close()} width="360px">
      <DialogHeader>
        <DialogTitle id={`${id}-title`}>
          <Row>
            <RowItem>
              <Icon iconSize="24px" url={svgToDataURL(icon)} />
            </RowItem>
            <RowItem expanded>
              {translate("popup_serpInfoMode_available")}
            </RowItem>
          </Row>
        </DialogTitle>
      </DialogHeader>
      <DialogFooter>
        <Row multiline right>
          <RowItem expanded>
            <IconButton
              aria-label={translate("popup_openOptionsLink")}
              className={FOCUS_START_CLASS}
              iconURL={svgToDataURL(cog)}
              title={translate("popup_openOptionsLink")}
              onClick={() => {
                void openOptionsPage();
              }}
            />
          </RowItem>
          <RowItem>
            <Button onClick={() => window.close()}>
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              className={`${FOCUS_END_CLASS} ${FOCUS_DEFAULT_CLASS}`}
              primary
              onClick={async () => {
                await browser.tabs.create({
                  url: "/pages/serpinfo-options.html",
                });
                window.close();
              }}
            >
              {translate("popup_serpInfoMode_setupButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </EmbeddedDialog>
  );
}

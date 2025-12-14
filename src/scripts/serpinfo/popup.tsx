import { useId, useState } from "react";
import { MatchPatternMap } from "../../common/match-pattern.ts";
import icon from "../../icons/icon.svg";
import { browser } from "../browser.ts";
import { Button, LinkButton } from "../components/button.tsx";
import {
  FOCUS_DEFAULT_CLASS,
  FOCUS_END_CLASS,
  FOCUS_START_CLASS,
} from "../components/constants.ts";
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmbeddedDialog,
} from "../components/dialog.tsx";
import { Icon } from "../components/icon.tsx";
import { ControlLabel, LabelWrapper } from "../components/label.tsx";
import { Row, RowItem } from "../components/row.tsx";
import { Switch } from "../components/switch.tsx";
import { loadFromLocalStorage } from "../local-storage.ts";
import { translate } from "../locales.ts";
import { sendMessage, sendMessageToTab } from "../messages.ts";
import { svgToDataURL } from "../utilities.ts";

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
            <Switch
              checked={!hideBlockedResults}
              id={`${id}-switch`}
              onChange={(e) => {
                const hideBlockedResults = !e.currentTarget.checked;
                setHideBlockedResults(hideBlockedResults);
                sendMessageToTab(
                  tabId,
                  "set-hide-blocked-results",
                  hideBlockedResults,
                ).catch((error) => {
                  console.error(error);
                });
              }}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row multiline right>
          <RowItem expanded>
            <LinkButton className={FOCUS_START_CLASS} onClick={openOptionsPage}>
              {translate("popup_openOptionsLink")}
            </LinkButton>
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
  const matchPatternMap = new MatchPatternMap<1>();
  for (const pattern of patterns) {
    matchPatternMap.set(pattern, 1);
  }
  return matchPatternMap.get(url).length > 0;
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
            <LinkButton className={FOCUS_START_CLASS} onClick={openOptionsPage}>
              {translate("popup_openOptionsLink")}
            </LinkButton>
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
                  url: "/pages/serpinfo/options.html",
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

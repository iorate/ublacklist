import { useState } from "react";
import icon from "../../icons/icon.svg";
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
}: { tabId: number; initialHideBlockedResults: boolean }): React.ReactNode {
  const [hideBlockedResults, setHideBlockedResults] = useState(
    initialHideBlockedResults,
  );
  return (
    <EmbeddedDialog close={() => window.close()} width="360px">
      <DialogHeader>
        <DialogTitle id="title">
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
              <ControlLabel for="showBlockedResults">
                {translate("popup_serpInfoMode_showBlockedResults")}
              </ControlLabel>
            </LabelWrapper>
          </RowItem>
          <RowItem>
            <Switch
              checked={!hideBlockedResults}
              id="showBlockedResults"
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

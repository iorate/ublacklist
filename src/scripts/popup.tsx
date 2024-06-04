import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MatchPatternMap } from "../common/match-pattern.ts";
import { SEARCH_ENGINES } from "../common/search-engines.ts";
import icon from "../icons/icon.svg";
import {
  BlockEmbeddedDialog,
  type BlockEmbeddedDialogProps,
} from "./block-dialog.tsx";
import { browser } from "./browser.ts";
import { Baseline } from "./components/baseline.tsx";
import { Button, LinkButton } from "./components/button.tsx";
import {
  FOCUS_DEFAULT_CLASS,
  FOCUS_END_CLASS,
  FOCUS_START_CLASS,
} from "./components/constants.ts";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmbeddedDialog,
} from "./components/dialog.tsx";
import { Icon } from "./components/icon.tsx";
import { Row, RowItem } from "./components/row.tsx";
import { AutoThemeProvider } from "./components/theme.tsx";
import { useClassName } from "./components/utilities.ts";
import { InteractiveRuleset } from "./interactive-ruleset.ts";
import { loadFromLocalStorage, saveToLocalStorage } from "./local-storage.ts";
import { translate } from "./locales.ts";
import { sendMessage } from "./messages.ts";
import { fromPlainRuleset, svgToDataURL } from "./utilities.ts";

async function openOptionsPage(): Promise<void> {
  await sendMessage("open-options-page");
  // https://github.com/iorate/ublacklist/issues/378
  if (process.env.BROWSER === "firefox") {
    window.close();
  }
}

const Loading: React.FC = () => {
  const className = useClassName(
    () => ({
      height: "calc(12.5em + 24px)", // The height of `BlockEmbeddedDialog`
      width: "360px",
    }),
    [],
  );
  return <div className={className} />;
};

type ActivateEmbeddedDialogProps = {
  active: boolean;
  match: string;
  tabId: number;
};

const ActivateEmbeddedDialog: React.FC<ActivateEmbeddedDialogProps> = ({
  active,
  match,
  tabId,
}) => (
  <EmbeddedDialog close={() => window.close()} width="360px">
    <DialogHeader>
      <DialogTitle id="title">
        <Row>
          <RowItem>
            <Icon iconSize="24px" url={svgToDataURL(icon)} />
          </RowItem>
          <RowItem expanded>
            {translate(active ? "popup_active" : "popup_inactive")}
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
          {active ? (
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
          ) : (
            <Row>
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
                    // In Chrome, the popup is closed immediately after 'permissions.request'!
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=952645
                    const [granted] = await Promise.all([
                      browser.permissions.request({ origins: [match] }),
                      process.env.BROWSER === "chrome"
                        ? browser.scripting.executeScript({
                            target: { tabId },
                            files: ["/scripts/content-script.js"],
                          })
                        : browser.tabs.executeScript(tabId, {
                            file: "/scripts/content-script.js",
                          }),
                    ]);
                    if (!granted) {
                      return;
                    }
                    await sendMessage("register-content-scripts");
                    window.close();
                  }}
                >
                  {translate("popup_activateButton")}
                </Button>
              </RowItem>
            </Row>
          )}
        </RowItem>
      </Row>
    </DialogFooter>
  </EmbeddedDialog>
);

const Popup: React.FC = () => {
  const [state, setState] = useState<
    | { type: "loading" }
    | { type: "activate"; props: ActivateEmbeddedDialogProps }
    | { type: "block"; props: BlockEmbeddedDialogProps }
  >({ type: "loading" });
  useEffect(() => {
    void (async () => {
      const [{ id: tabId, url, title = null }] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabId == null || url == null) {
        return;
      }
      const map = new MatchPatternMap<string>();
      for (const { contentScripts } of Object.values(SEARCH_ENGINES)) {
        for (const { matches } of contentScripts) {
          for (const match of matches) {
            map.set(match, match);
          }
        }
      }
      let match = null;
      try {
        match = map.get(url)[0] ?? null;
      } catch {
        // Invalid URL
      }
      if (match != null) {
        const active =
          process.env.BROWSER === "chrome"
            ? (
                await browser.scripting.executeScript({
                  target: { tabId },
                  files: ["/scripts/active.js"],
                })
              )[0].result
            : (
                await browser.tabs.executeScript(tabId, {
                  file: "/scripts/active.js",
                })
              )[0];
        setState({
          type: "activate",
          props: {
            active: Boolean(active),
            match,
            tabId,
          },
        });
      } else {
        const options = await loadFromLocalStorage([
          "ruleset",
          "blacklist",
          "subscriptions",
          "enablePathDepth",
          "blockWholeSite",
        ]);
        const ruleset = new InteractiveRuleset(
          fromPlainRuleset(options.ruleset || null, options.blacklist),
          Object.values(options.subscriptions)
            .filter((subscription) => subscription.enabled ?? true)
            .map(({ ruleset, blacklist }) =>
              fromPlainRuleset(ruleset || null, blacklist),
            ),
        );
        setState({
          type: "block",
          props: {
            blockWholeSite: options.blockWholeSite,
            close: () => window.close(),
            enablePathDepth: options.enablePathDepth,
            openOptionsPage,
            entryProps: {
              url,
              ...(title != null ? { title } : {}),
            },
            ruleset,
            onBlocked: () =>
              saveToLocalStorage({ blacklist: ruleset.toString() }, "popup"),
          },
        });
      }
    })();
  }, []);
  return (
    <AutoThemeProvider>
      <Baseline>
        {state.type === "loading" ? (
          <Loading />
        ) : state.type === "activate" ? (
          <ActivateEmbeddedDialog {...state.props} />
        ) : (
          <BlockEmbeddedDialog {...state.props} />
        )}
      </Baseline>
    </AutoThemeProvider>
  );
};

function main(): void {
  document.documentElement.lang = translate("lang");
  const root = createRoot(
    document.body.appendChild(document.createElement("div")),
  );
  root.render(<Popup />);
}

void main();

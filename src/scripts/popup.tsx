import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BlockEmbeddedDialog,
  type BlockEmbeddedDialogProps,
} from "./block-dialog.tsx";
import { browser } from "./browser.ts";
import { Baseline } from "./components/baseline.tsx";
import { AutoThemeProvider } from "./components/theme.tsx";
import { useClassName } from "./components/utilities.ts";
import { InteractiveRuleset } from "./interactive-ruleset.ts";
import { loadFromLocalStorage, saveToLocalStorage } from "./local-storage.ts";
import { translate } from "./locales.ts";
import { sendMessage, sendMessageToTab } from "./messages.ts";
import { SerpInfoEmbeddedDialog } from "./serpinfo/popup.tsx";
import { fromPlainRuleset } from "./utilities.ts";

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

const Popup: React.FC = () => {
  const [state, setState] = useState<
    | { type: "loading" }
    | {
        type: "serpInfo";
        props: React.ComponentProps<typeof SerpInfoEmbeddedDialog>;
      }
    | { type: "block"; props: BlockEmbeddedDialogProps }
  >({ type: "loading" });
  useEffect(() => {
    void (async () => {
      const {
        id: tabId,
        url,
        title = null,
        // biome-ignore lint/style/noNonNullAssertion: We can expect that this query returns at least one tab.
      } = (await browser.tabs.query({ active: true, currentWindow: true }))[0]!;
      if (tabId == null || url == null) {
        return;
      }
      try {
        const hideBlockedResults = await sendMessageToTab(
          tabId,
          "get-hide-blocked-results",
        );
        setState({
          type: "serpInfo",
          props: {
            tabId,
            initialHideBlockedResults: hideBlockedResults,
          },
        });
        return;
      } catch {
        // SERPINFO mode is not applied
      }
      const options = await loadFromLocalStorage([
        "ruleset",
        "blacklist",
        "subscriptions",
        "enablePathDepth",
        "enableMatchingRules",
        "blockWholeSite",
      ]);
      const ruleset = new InteractiveRuleset(
        fromPlainRuleset(options.ruleset || null, options.blacklist),
        Object.values(options.subscriptions)
          .filter((subscription) => subscription.enabled ?? true)
          .map(({ ruleset, blacklist, name }) => ({
            name,
            ruleset: fromPlainRuleset(ruleset || null, blacklist),
          })),
      );
      setState({
        type: "block",
        props: {
          blockWholeSite: options.blockWholeSite,
          close: () => window.close(),
          enablePathDepth: options.enablePathDepth,
          enableMatchingRules: options.enableMatchingRules,
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
    })();
  }, []);
  return (
    <AutoThemeProvider>
      <Baseline>
        {state.type === "loading" ? (
          <Loading />
        ) : state.type === "serpInfo" ? (
          <SerpInfoEmbeddedDialog {...state.props} />
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

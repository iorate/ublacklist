import "../styles/theme.css";
import "../styles/baseline.css";
import isMobile from "is-mobile";
import { useEffect, useId, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BlockForm, type BlockFormProps } from "../block-dialog.ts";
import { AutoThemeProvider } from "../components/theme.tsx";
import { browser } from "../shared/browser.ts";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "../shared/local-storage.ts";
import { translate } from "../shared/locales.ts";
import { sendMessage, sendMessageToTab } from "../shared/messages.ts";
import { createInteractiveRuleset } from "../shared/utilities.ts";
import { PopupDialog } from "./dialog.tsx";
import styles from "./index.module.css";
import {
  canEnableSerpInfo,
  EnableSerpInfoPopupDialog,
  SerpInfoPopupDialog,
} from "./serpinfo.tsx";

async function openOptionsPage(): Promise<void> {
  await sendMessage("open-options-page");
  // https://github.com/iorate/ublacklist/issues/378
  if (process.env.BROWSER === "firefox") {
    window.close();
  }
}

function Loading() {
  return <div className={styles.loading} />;
}

type BlockPopupDialogProps = Omit<
  BlockFormProps,
  "id" | "initialFocusRef" | "portalContainer"
>;

function BlockPopupDialog(props: BlockPopupDialogProps) {
  const id = useId();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  return (
    <PopupDialog
      aria-labelledby={`${id}-title`}
      close={props.close}
      initialFocus={initialFocusRef}
    >
      <BlockForm id={id} initialFocusRef={initialFocusRef} {...props} />
    </PopupDialog>
  );
}

async function queryUserAgent(tabId: number): Promise<string> {
  const [result] = await browser.scripting.executeScript({
    target: { tabId },
    func: () => window.navigator.userAgent,
    injectImmediately: true,
  });
  if (!result || typeof result.result !== "string") {
    throw new Error("Failed to get user agent");
  }
  return result.result;
}

function Popup() {
  const [state, setState] = useState<
    | { type: "loading" }
    | {
        type: "serpInfo";
        props: React.ComponentProps<typeof SerpInfoPopupDialog>;
      }
    | { type: "enableSerpInfo" }
    | { type: "block"; props: BlockPopupDialogProps }
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
      try {
        const userAgent = await queryUserAgent(tabId);
        const mobile = isMobile({ ua: userAgent });
        if (await canEnableSerpInfo(url, mobile)) {
          setState({ type: "enableSerpInfo" });
          return;
        }
      } catch {
        // Should not happen
      }
      const options = await loadFromLocalStorage([
        "ruleset",
        "blacklist",
        "subscriptions",
        "blockWholeSite",
        "enableMatchingRules",
      ]);
      const ruleset = createInteractiveRuleset(
        options.blacklist,
        options.ruleset,
        options.subscriptions,
      );
      setState({
        type: "block",
        props: {
          blockWholeSite: options.blockWholeSite,
          close: () => window.close(),
          enableMatchingRules: options.enableMatchingRules,
          openOptionsPage,
          ruleset,
          searchResult: { url, props: title != null ? { title } : {} },
          onBlocked: (newSource) =>
            saveToLocalStorage({ blacklist: newSource }, "popup"),
        },
      });
    })();
  }, []);
  return (
    <AutoThemeProvider>
      {state.type === "loading" ? (
        <Loading />
      ) : state.type === "serpInfo" ? (
        <SerpInfoPopupDialog {...state.props} />
      ) : state.type === "enableSerpInfo" ? (
        <EnableSerpInfoPopupDialog />
      ) : (
        <BlockPopupDialog {...state.props} />
      )}
    </AutoThemeProvider>
  );
}

function main(): void {
  document.documentElement.lang = translate("lang");
  const root = createRoot(
    document.body.appendChild(document.createElement("div")),
  );
  root.render(<Popup />);
}

void main();

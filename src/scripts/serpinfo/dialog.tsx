import { colord } from "colord";
import { type Root, createRoot } from "react-dom/client";
import { BlockDialog } from "../block-dialog.tsx";
import type { InteractiveRuleset } from "../interactive-ruleset.ts";
import { saveToLocalStorage } from "../local-storage.ts";
import { sendMessage } from "../messages.ts";
import type { DialogTheme } from "../types.ts";
import { storageStore } from "./storage-store.ts";
import type { Result } from "./types.ts";

type DialogRoot = { root: Root; shadowRoot: ShadowRoot };

let dialogRoot: DialogRoot | null = null;

function getDialogRoot(): DialogRoot {
  if (!dialogRoot) {
    const shadowRoot = document.body
      .appendChild(document.createElement("div"))
      .attachShadow({ mode: "open" });
    const root = createRoot(shadowRoot);
    dialogRoot = { root, shadowRoot };
  }
  return dialogRoot;
}

function getDialogTheme(): DialogTheme {
  try {
    const bodyColor = colord(
      window.getComputedStyle(document.body).backgroundColor,
    );
    if (bodyColor.alpha() !== 0) {
      return bodyColor.isDark() ? "dark" : "light";
    }
    const htmlColor = colord(
      window.getComputedStyle(document.documentElement).backgroundColor,
    );
    return htmlColor.alpha() !== 0 && htmlColor.isDark() ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function closeDialog() {
  if (!dialogRoot) {
    return;
  }
  dialogRoot.root.render(null);
}

export function openDialog(result: Result, ruleset: InteractiveRuleset) {
  const state = storageStore.get();
  const props = { ...result.props, url: result.url };
  const onBlocked = () =>
    void saveToLocalStorage(
      { blacklist: ruleset.toString() },
      "content-script",
    );
  if (state.skipBlockDialog) {
    ruleset.createPatch(props, state.blockWholeSite);
    ruleset.applyPatch();
    onBlocked();
    return;
  }
  const dialogRoot = getDialogRoot();
  dialogRoot.root.render(
    <BlockDialog
      blockWholeSite={state.blockWholeSite}
      close={closeDialog}
      enablePathDepth={state.enablePathDepth}
      enableMatchingRules={state.enableMatchingRules}
      entryProps={props}
      open={true}
      openOptionsPage={() => sendMessage("open-options-page")}
      ruleset={ruleset}
      target={dialogRoot.shadowRoot}
      theme={
        state.dialogTheme !== "default" ? state.dialogTheme : getDialogTheme()
      }
      onBlocked={onBlocked}
    />,
  );
}

import { createRoot, type Root } from "react-dom/client";
import { BlockDialog } from "../block-dialog.tsx";
import type { InteractiveRuleset } from "../interactive-ruleset.ts";
import { saveToLocalStorage } from "../local-storage.ts";
import { sendMessage } from "../messages.ts";
import type { DialogTheme } from "../types.ts";
import { isDarkMode } from "./is-dark-mode.ts";
import { storageStore } from "./storage-store.ts";

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
  return isDarkMode() ? "dark" : "light";
}

export function closeDialog() {
  if (!dialogRoot) {
    return;
  }
  dialogRoot.root.render(null);
}

export function openDialog(
  url: string,
  props: Record<string, string>,
  ruleset: InteractiveRuleset,
  event: MouseEvent,
) {
  const state = storageStore.get();
  const searchResult = { url, props };
  const onBlocked = (newSource: string) =>
    void saveToLocalStorage({ blacklist: newSource }, "content-script");
  const shouldSkipDialog = event.shiftKey
    ? !state.skipBlockDialog
    : state.skipBlockDialog;
  if (shouldSkipDialog) {
    const patch = ruleset.createPatch(null, searchResult, {
      useRegistrableDomain: state.blockWholeSite,
    });
    onBlocked(ruleset.applyPatch(patch));
    return;
  }
  const dialogRoot = getDialogRoot();
  dialogRoot.root.render(
    <BlockDialog
      blockWholeSite={state.blockWholeSite}
      close={closeDialog}
      enableMatchingRules={state.enableMatchingRules}
      open={true}
      openOptionsPage={() => sendMessage("open-options-page")}
      ruleset={ruleset}
      searchResult={searchResult}
      target={dialogRoot.shadowRoot}
      theme={
        state.dialogTheme !== "default" ? state.dialogTheme : getDialogTheme()
      }
      onBlocked={onBlocked}
    />,
  );
}

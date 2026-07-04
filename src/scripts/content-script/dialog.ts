import { browser } from "../shared/browser.ts";
import type { InteractiveRuleset } from "../shared/interactive-ruleset.ts";
import { saveToLocalStorage } from "../shared/local-storage.ts";
import { sendMessage } from "../shared/messages.ts";
import { storageStore } from "../shared/storage-store.ts";
import { isDarkMode } from "./is-dark-mode.ts";

type BlockDialogModule = typeof import("../block-dialog.ts");

let loadedModule: BlockDialogModule | null = null;
let modulePromise: Promise<BlockDialogModule> | null = null;

function loadModule(): Promise<BlockDialogModule> {
  modulePromise ??= (
    import(
      browser.runtime.getURL("scripts/block-dialog.js")
    ) as Promise<BlockDialogModule>
  ).then((module) => {
    loadedModule = module;
    return module;
  });
  return modulePromise;
}

export function openDialog(
  url: string,
  props: Record<string, string>,
  ruleset: InteractiveRuleset,
  event: MouseEvent,
): void {
  const state = storageStore.get();
  void loadModule().then((module) =>
    module.openDialog({
      url,
      props,
      ruleset,
      skipDialog: event.shiftKey
        ? !state.skipBlockDialog
        : state.skipBlockDialog,
      theme:
        state.dialogTheme !== "default"
          ? state.dialogTheme
          : isDarkMode()
            ? "dark"
            : "light",
      blockWholeSite: state.blockWholeSite,
      enableMatchingRules: state.enableMatchingRules,
      onBlocked: (newSource) =>
        void saveToLocalStorage({ blacklist: newSource }, "content-script"),
      openOptionsPage: () => void sendMessage("open-options-page"),
    }),
  );
}

export function closeDialog(): void {
  loadedModule?.closeDialog();
}

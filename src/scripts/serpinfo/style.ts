import { createStore } from "zustand/vanilla";
import { shallow } from "zustand/vanilla/shallow";
import { addMessageListeners } from "../messages.ts";
import * as C from "./constants.ts";
import * as GlobalStyles from "./global-styles.ts";
import { storageStore } from "./storage-store.ts";

const hideBlockedResultsStore = createStore(() => true);

export function setupPopupListeners() {
  addMessageListeners({
    "get-hide-blocked-results"() {
      return hideBlockedResultsStore.getState();
    },
    "set-hide-blocked-results"(hide) {
      hideBlockedResultsStore.setState(hide);
    },
  });
}

function hideBlockedResults(hide: boolean) {
  const RB = C.RESULT_BLOCK_ATTRIBUTE;
  GlobalStyles.set(
    "result-hide",
    hide
      ? `[${RB}="1"]{display:none !important;}` +
          `[${RB}="2"],[${RB}="2"] *{visibility:hidden !important;}`
      : "",
  );
}

function hideBlockButtons(hide: boolean) {
  const B = C.BUTTON_ATTRIBUTE;
  GlobalStyles.set(
    "button-hide",
    hide ? `[${B}]{display:none !important;}` : "",
  );
}

function setBlockColor(color: string) {
  const RB = C.RESULT_BLOCK_ATTRIBUTE;
  GlobalStyles.set(
    "result-block",
    `[${RB}]{background-color:${color !== "default" ? color : "rgba(255,192,192,.5)"} !important;}` +
      `[${RB}] *{background-color:transparent !important;}`,
  );
}

function setHightlightColors(colors: readonly string[]) {
  const RH = C.RESULT_HIGHLIGHT_ATTRIBUTE;
  GlobalStyles.set(
    "result-highlight",
    colors
      .map(
        (color, index) =>
          `[${RH}="${index + 1}"]{background-color:${color} !important;}` +
          `[${RH}="${index + 1}"] *{background-color:transparent !important;}`,
      )
      .join(""),
  );
}

export function style() {
  const state = storageStore.get();
  hideBlockedResults(hideBlockedResultsStore.getState());
  hideBlockButtons(state.hideBlockLinks);
  setBlockColor(state.blockColor);
  setHightlightColors(state.highlightColors);

  hideBlockedResultsStore.subscribe((hide) => hideBlockedResults(hide));
  storageStore.subscribe(
    (state) => state.hideBlockLinks,
    (hide) => hideBlockButtons(hide),
  );
  storageStore.subscribe(
    (state) => state.blockColor,
    (color) => setBlockColor(color),
  );
  storageStore.subscribe(
    (state) => state.highlightColors,
    (colors) => setHightlightColors(colors),
    { equalityFn: shallow },
  );
}

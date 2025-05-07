import { createStore } from "zustand/vanilla";
import { shallow } from "zustand/vanilla/shallow";
import { addMessageListeners } from "../messages.ts";
import * as C from "./constants.ts";
import { storageStore } from "./storage-store.ts";

const HIDE_BLOCKED_RESULTS_STYLE_ID = "ub-hide-blocked-results";
const HIDE_BLOCK_BUTTONS_STYLE_ID = "ub-hide-block-buttons";
const SET_BLOCK_COLOR_STYLE_ID = "ub-set-block-color";
const SET_HIGHLIGHT_COLORS_STYLE_ID = "ub-set-highlight-colors";

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

function getStyleElement(id: string): HTMLStyleElement {
  const style = document.getElementById(id);
  if (style) {
    if (!(style instanceof HTMLStyleElement)) {
      throw new Error(`#${id} is not a style element`);
    }
    return style;
  }
  const newStyle = document.head.appendChild(document.createElement("style"));
  newStyle.id = id;
  return newStyle;
}

function hideBlockedResults(hide: boolean) {
  getStyleElement(HIDE_BLOCKED_RESULTS_STYLE_ID).textContent = hide
    ? `[${C.BLOCK_ATTRIBUTE}="1"] { display:none !important; } ` +
      `[${C.BLOCK_ATTRIBUTE}="2"], [${C.BLOCK_ATTRIBUTE}="2"] * { visibility:hidden !important; } `
    : "";
}

function hideBlockButtons(hide: boolean) {
  getStyleElement(HIDE_BLOCK_BUTTONS_STYLE_ID).textContent = hide
    ? `[${C.BUTTON_ATTRIBUTE}] { display:none; }`
    : "";
}

function setBlockColor(color: string) {
  getStyleElement(SET_BLOCK_COLOR_STYLE_ID).textContent =
    `[${C.BLOCK_ATTRIBUTE}] { background-color: ${color !== "default" ? color : "rgba(255, 192, 192, 0.5)"} !important; } ` +
    `[${C.BLOCK_ATTRIBUTE}] * { background-color: transparent !important; }`;
}

function setHightlightColors(colors: readonly string[]) {
  getStyleElement(SET_HIGHLIGHT_COLORS_STYLE_ID).textContent = colors
    .map(
      (color, index) =>
        `[${C.HIGHLIGHT_ATTRIBUTE}="${index + 1}"] { background-color: ${color} !important; } ` +
        `[${C.HIGHLIGHT_ATTRIBUTE}="${index + 1}"] * { background-color: transparent !important; }`,
    )
    .join(" ");
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

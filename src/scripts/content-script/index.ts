import { Draggable } from "@neodrag/vanilla";
import { MatchPattern, MatchPatternMap } from "@ublacklist/match-pattern";
import type { SerpDescription } from "@ublacklist/serpinfo";
import isMobile from "is-mobile";
import { createStore } from "zustand/vanilla";
import iconSVG from "../../icons/icon.svg";
import { translate } from "../shared/locales.ts";
import { addMessageListeners } from "../shared/messages.ts";
import type { SerpIndex } from "../shared/serpinfo-settings.ts";
import { storageStore } from "../shared/storage-store.ts";
import { attributes as a, classes as c } from "./constants.ts";
import { cssStringify } from "./css-stringify.ts";
import { blockedResultCountStore, setupFilter } from "./filter.ts";
import { setGlobalStyle, setStaticGlobalStyle } from "./global-styles.ts";
import { createIsDarkModeStore } from "./is-dark-mode.ts";
import {
  buildBlockStyle,
  buildHideStyle,
  buildHighlightStyle,
} from "./style-builders.ts";

const hideBlockedResultsStore = createStore(() => true);

function getSerpDescriptions(): SerpDescription[] {
  const settings = storageStore.getState().serpInfoSettings;
  const url = window.location.href;
  const mobile = isMobile({ tablet: true });
  return new MatchPatternMap<SerpIndex>(settings.serpIndexMap)
    .get(url)
    .flatMap((index) => {
      const serp =
        index[0] === "user"
          ? settings.user.parsed?.pages[index[1]]
          : settings.remote[index[1]]?.parsed?.pages[index[2]];
      if (!serp) {
        return [];
      }
      if (
        serp.excludeMatches &&
        new MatchPattern(serp.excludeMatches).test(url)
      ) {
        return [];
      }
      if (serp.includeRegex && !new RegExp(serp.includeRegex).test(url)) {
        return [];
      }
      if (serp.excludeRegex && new RegExp(serp.excludeRegex).test(url)) {
        return [];
      }
      if (
        (serp.userAgent === "desktop" && mobile) ||
        (serp.userAgent === "mobile" && !mobile)
      ) {
        return [];
      }
      return serp;
    });
}

function getDelay(serps: readonly SerpDescription[]): number | null {
  const maxDelay = Math.max(
    ...serps.map(({ delay }) =>
      typeof delay === "number" ? delay : delay ? 0 : -1,
    ),
  );
  return maxDelay >= 0 ? maxDelay : null;
}

function setupPopupListeners() {
  addMessageListeners({
    "get-hide-blocked-results"() {
      return hideBlockedResultsStore.getState();
    },
    "set-hide-blocked-results"(hide) {
      hideBlockedResultsStore.setState(hide);
    },
  });
}

function setupStyles(serps: readonly SerpDescription[]) {
  const extraSelectors = [
    ...new Set(
      serps.flatMap((serp) =>
        serp.results.flatMap((result) =>
          result?.extraSelector != null ? [result.extraSelector] : [],
        ),
      ),
    ),
  ];

  // Hide blocked results
  setStaticGlobalStyle("hide-blocked-results", buildHideStyle(extraSelectors));
  toggleDocumentAttribute(
    a.hideBlockedResults,
    hideBlockedResultsStore.getState(),
  );
  hideBlockedResultsStore.subscribe((value) =>
    toggleDocumentAttribute(a.hideBlockedResults, value),
  );
  // Hide buttons
  setStaticGlobalStyle("hide-buttons", {
    [`[${a.hideButtons}] .${c.button}`]: {
      display: "none",
    },
  });
  storageStore.subscribe(
    (state) => state.hideBlockLinks,
    (value) => toggleDocumentAttribute(a.hideButtons, value),
    { fireImmediately: true },
  );
  // Hide control
  setStaticGlobalStyle("hide-control", {
    [`[${a.hideControl}] .${c.control}`]: {
      display: "none",
    },
  });
  storageStore.subscribe(
    (state) => state.hideControl,
    (value) => toggleDocumentAttribute(a.hideControl, value),
    { fireImmediately: true },
  );
  // Block color
  storageStore.subscribe(
    (state) => state.blockColor,
    (color) =>
      setGlobalStyle("block-color", buildBlockStyle(extraSelectors, color)),
    { fireImmediately: true },
  );
  // Highlight colors
  storageStore.subscribe(
    (state) => state.highlightColors,
    (colors) =>
      setGlobalStyle(
        "highlight-colors",
        buildHighlightStyle(extraSelectors, colors),
      ),
    { fireImmediately: true },
  );
}

function toggleDocumentAttribute(name: string, value: boolean) {
  if (value) {
    document.documentElement.setAttribute(name, "1");
  } else {
    document.documentElement.removeAttribute(name);
  }
}

function setupControl() {
  const control = document.createElement("div");
  setStaticGlobalStyle("control", {
    [`.${c.control}`]: {
      position: "fixed",
      top: "4px",
      right: "4px",
      zIndex: 99999,
      visibility: "hidden",
    },
  });
  control.classList.add(c.control);
  const updateColors = (dark: boolean) => {
    control.style.setProperty(
      "--ub-control-background-color",
      dark ? "rgb(41 42 45)" : "white",
    );
    control.style.setProperty(
      "--ub-control-color",
      dark ? "rgb(232 234 237)" : "rgb(32 33 36)",
    );
  };
  const isDarkModeStore = createIsDarkModeStore();
  updateColors(isDarkModeStore.getState());
  isDarkModeStore.subscribe(updateColors);

  const shadowRoot = control.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <style>${cssStringify(
      {
        button: {
          alignItems: "center",
          backgroundColor: "var(--ub-control-background-color)",
          border: "none",
          borderRadius: "4px",
          boxShadow: "0 0 2px rgb(0 0 0 / 0.12), 0 2px 2px rgb(0 0 0 / 0.24)",
          color: "var(--ub-control-color)",
          cursor: "pointer",
          display: "flex",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          fontSize: "14px",
          gap: "8px",
          justifyContent: "center",
          height: "28px",
          padding: "0 8px",
          visibility: "visible",
        },
        svg: {
          width: "20px",
          height: "20px",
        },
        ".hidden": {
          visibility: "hidden",
        },
        ".translucent": {
          opacity: "0.38",
        },
      },
      2,
    )}</style>
    <button type="button">
      ${iconSVG}
      <span></span>
    </button>
  `;
  // biome-ignore lint/style/noNonNullAssertion: <button> always exists
  const button = shadowRoot.querySelector("button")!;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    hideBlockedResultsStore.setState((value) => !value);
  });
  // biome-ignore lint/style/noNonNullAssertion: <svg> always exists
  const svg = button.querySelector("svg")!;
  svg.role = "img";
  // biome-ignore lint/style/noNonNullAssertion: <span> always exists
  const span = button.querySelector("span")!;

  const handleHideBlockedResultsChange = (value: boolean) => {
    button.classList.toggle("translucent", !value);
    svg.ariaLabel = value
      ? translate("content_showBlockedSitesLink")
      : translate("content_hideBlockedSitesLink");
  };
  handleHideBlockedResultsChange(hideBlockedResultsStore.getState());
  hideBlockedResultsStore.subscribe(handleHideBlockedResultsChange);

  const handleBlockedResultCountChange = (value: number) => {
    button.classList.toggle("hidden", value === 0);
    span.textContent = String(value);
  };
  handleBlockedResultCountChange(blockedResultCountStore.getState());
  blockedResultCountStore.subscribe(handleBlockedResultCountChange);

  document.body.appendChild(control);

  // Make the button draggable in case it interferes with other elements
  new Draggable(button);
}

function awaitBody(callback: () => void) {
  if (document.body) {
    callback();
  } else {
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }
}

function awaitLoad(callback: () => void) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback);
  }
}

storageStore.attachPromise.then(() => {
  const serps = getSerpDescriptions();
  if (serps.length === 0) {
    return;
  }
  const delay = getDelay(serps);

  setupPopupListeners();

  const start = () => {
    setupStyles(serps);
    setupControl();
    setupFilter(serps);
  };
  if (delay != null) {
    awaitLoad(() => window.setTimeout(start, delay));
  } else {
    awaitBody(start);
  }
});

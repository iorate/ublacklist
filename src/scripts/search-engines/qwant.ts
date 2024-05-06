import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import type { SearchEngine, SerpHandler } from "../types.ts";
import { handleSerp } from "./helpers.ts";

function getSerpHandler(): SerpHandler {
  return handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor:
          "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
      },
      '.theme-dark [data-ub-blocked="visible"], [data-theme="dark"] [data-ub-blocked="visible"]':
        {
          backgroundColor:
            "var(--ub-block-color, rgba(101, 8, 8, 0.5)) !important",
        },
      ".ub-button": {
        color: "var(--ub-link-color, rgb(93, 96, 94))",
      },
      '.theme-dark .ub-button, [data-theme="dark"] .ub-button': {
        color: "var(--ub-link-color, rgb(122, 140, 109))",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
      "div[class*=Text-module__permaLink]": {
        display: "flex",
        maxWidth: "none !important",
      },
      ".qwant-control": {
        display: "block",
        fontSize: "13px",
        marginTop: "10px",
        color: "rgb(89, 89, 95)",
      },
      '.theme-dark .qwant-control, [data-theme="dark"] .qwant-control': {
        color: "rgb(217, 217, 224)",
      },
      ".qwant-lite-control": {
        display: "block",
        fontSize: "13px",
        marginBottom: "10px",
        color: "rgb(89, 89, 95)",
      },
      '.theme-dark .qwant-lite-control, [data-theme="dark"] .qwant-lite-control':
        {
          color: "rgb(217, 217, 224)",
        },
    },
    controlHandlers: [
      {
        target: "[class*=SearchFilter-module__SearchFilter___]",
        position: "beforeend",
        style: "qwant-control",
      },
      {
        target: "section.content",
        position: "afterbegin",
        style: "qwant-lite-control",
      },
    ],
    entryHandlers: [
      {
        // Web
        target: "[domain]",
        url: "a",
        title: "a",
        actionTarget: "[class*=Text-module__permaLink]",
        actionStyle: {
          fontSize: "13px",
          paddingLeft: "5px",
        },
      },
      {
        // News
        target: "[class*=News-module__NewsList] > div",
        url: "a",
        title: "a [class*=News-module__NewsTitle]",
        actionTarget: "[class*=Text-module__permaLink]",
        actionStyle: {
          fontSize: "13px",
          paddingLeft: "5px",
        },
      },
      {
        // Images
        target: "[data-testid=imageResult]",
        url: (root) => {
          const host = root.querySelector("cite")?.textContent;
          return host != null ? `https://${host}/` : null;
        },
        title: "h2",
        actionTarget: "[class*=Text-module__permaLink]",
        actionStyle: {
          fontSize: "12px",
          paddingLeft: "5px",
        },
      },
      {
        // Videos
        target: "[class*=Videos-module__VideoCard]",
        url: (root) => root.getAttribute("href"),
        title: "[class*=Videos-module__VideoCardTitle]",
        actionTarget: "[class*=Videos-module__VideoCardMeta]",
        actionStyle: {
          display: "block",
          fontSize: "13px",
        },
      },
      {
        // Lite
        target: "article",
        url: (root) => root.querySelector(".url")?.textContent ?? null,
        title: "a",
        actionTarget: ".url",
        actionStyle: {
          fontSize: "13px",
          paddingLeft: "5px",
        },
      },
    ],
    pagerHandlers: [
      // Top page -> Web
      {
        target: "[class*=SearchLayout-module__container___]",
        innerTargets: "[class*=SearchFilter-module__SearchFilter___]",
      },
      {
        target: "[class*=Web-module__container___]",
        innerTargets: "[class*=SearchFilter-module__SearchFilter___], [domain]",
      },
      {
        target: "[class*=News-module__NewsLayout___]",
        innerTargets:
          "[class*=SearchFilter-module__SearchFilter___], [class*=News-module__NewsList___] > div",
      },
      {
        target: "[class*=Images-module__ImagesLayout___]",
        innerTargets:
          "[class*=SearchFilter-module__SearchFilter___], [data-testid=imageResult]",
      },
      {
        target: "[data-testid=videosList]",
        innerTargets:
          "[class*=SearchFilter-module__SearchFilter___], [class*=Videos-module__VideoCard]",
      },
      {
        target: "[class*=Stack-module__VerticalStack]",
        innerTargets: "[domain], [class*=News-module__NewsList___] > div",
      },
    ],
    getDialogTheme: () =>
      document.body.dataset.theme === "dark" ||
      document.documentElement.classList.contains("theme-dark")
        ? "dark"
        : "light",
    observeRemoval: true,
  });
}

export const qwant: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.qwant,
  getSerpHandler,
};

import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import { css } from "../styles.ts";
import type { SearchEngine, SerpHandler } from "../types.ts";
import { handleSerp, hasDarkBackground } from "./helpers.ts";

function getSerpHandler(): SerpHandler {
  return handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor:
          "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
      },
      ".ub-button": {
        color: "var(--ub-link-color, rgb(101, 115, 255))",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
    },
    controlHandlers: [
      {
        target: ".filters",
        position: "afterend",
        style: {
          display: "block",
          marginLeft: "133px",
          padding: "0 17px 17px",
          "@media (max-width: 990px)": {
            margin: "auto",
            padding: "0 17px 16px",
          },
        },
      },
    ],
    entryHandlers: [
      // Web
      {
        target: ".w-gl > .result",
        url: ".result-link",
        title: "h2",
        actionTarget: "",
        actionStyle: {
          display: "block",
          marginTop: "4px",
        },
        props: {
          $category: "web",
        },
      },
      // News
      {
        target: ".article",
        url: ".article-left > a",
        title: "h3",
        actionTarget: ".article-left",
        actionStyle: {
          display: "block",
          fontSize: "16px",
          marginTop: "4px",
        },
        props: {
          $category: "news",
        },
      },
      // Videos
      {
        target: ".vo-bg > .result",
        url: ".details > a",
        title: ".title",
        actionTarget: ".details",
        actionStyle: (actionRoot) => {
          // Overwrite the height of "Anonymous View" from "100%" to "auto" for mobile view
          (actionRoot.previousElementSibling as HTMLElement).style.height =
            "auto";
          actionRoot.className = css({
            display: "block",
            marginTop: "4px",
          });
        },
        props: {
          $category: "videos",
        },
      },
    ],
    getDialogTheme: () =>
      hasDarkBackground(document.documentElement) ? "dark" : "light",
    pageProps: {
      $site: "startpage",
    },
  });
}

export const startpage: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.startpage,
  getSerpHandler,
};

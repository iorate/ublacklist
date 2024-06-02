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
      ".ub-button": {
        color: "var(--ub-link-color, rgb(0, 100, 77))",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
    },
    controlHandlers: [
      {
        target: "body",
        position: "afterbegin",
        style: {
          display: "block",
          fontSize: "13px",
          padding: "9px 20px",
          textAlign: "right",
        },
      },
    ],
    entryHandlers: [
      {
        target: ".result",
        url: "a",
        title: "a",
        actionTarget: (root) => root.querySelector(".result__body") || root,
        actionStyle: {
          display: "block",
          fontSize: "13px",
          order: 1,
          paddingTop: "5px",
        },
      },
    ],
    pageProps: {
      $engine: "ecosia",
      $category: "web",
    },
  });
}

export const ecosia: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.ecosia,
  getSerpHandler,
};

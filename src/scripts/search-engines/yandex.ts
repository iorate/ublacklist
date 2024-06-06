import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import type { CSSAttribute } from "../styles.ts";
import type { SearchEngine, SerpHandler } from "../types.ts";
import { getDialogThemeFromBody, handleSerp } from "./helpers.ts";

const globalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor:
      "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
  },
  ".ub-button": {
    color: "var(--ub-link-color, var(--depot-color-link))",
    fontSize: "14px",
    lineHeight: "17px",
  },
  ".ub-button:hover": {
    color: "var(--ub-link-color, var(--depot-color-link-hovered))",
  },
};

const serpHandler: SerpHandler = handleSerp({
  globalStyle,
  controlHandlers: [
    {
      target: ".content__left",
      position: "beforebegin",
      style: {
        display: "block",
        marginBottom: "20px",
      },
    },
  ],
  entryHandlers: [
    {
      target: "li.serp-item",
      url: ".organic__url",
      title: ".organic__title",
      actionTarget: ".organic__subtitle",
      actionStyle: {
        marginLeft: "2px",
      },
    },
  ],
  getDialogTheme: getDialogThemeFromBody(),
  pageProps: {
    $site: "yandex",
    $category: "web",
  },
});

export const yandex: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.yandex,
  getSerpHandler() {
    return serpHandler;
  },
};

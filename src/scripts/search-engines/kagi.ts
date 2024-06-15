import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import type { SearchEngine, SerpHandler } from "../types.ts";
import { getDialogThemeFromBody, handleSerp } from "./helpers.ts";

function getSerpHandler(): SerpHandler {
  return handleSerp({
    // https://github.com/iorate/ublacklist/pull/374
    delay: 400,

    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor:
          "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
    },
    controlHandlers: [
      {
        target: "._ext_filter_box",
        position: "afterend",
        style: "_ub_filter_box",
      },
    ],
    entryHandlers: [
      // All
      {
        target: "._ext_r",
        url: "._ext_u",
        title: "._ext_t",
        actionTarget: "._ext_a",
        actionStyle: "_ub_act_btn_box",
        props: () => {
          const subdirectory = new URL(location.href).pathname.split("/")[1];
          return {
            $category: subdirectory === "search" ? "web" : subdirectory,
          };
        },
      },
    ],
    pagerHandlers: [
      {
        target: "._0_img-grid, .videos, .news, .podcast_results",
        innerTargets: "._ext_r",
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
    pageProps: {
      $site: "kagi",
    },
  });
}

export const kagi: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.kagi,
  getSerpHandler,
};

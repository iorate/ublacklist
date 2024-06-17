import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import type { SearchEngine, SerpHandler } from "../types.ts";
import { getDialogThemeFromBody, handleSerp } from "./helpers.ts";

function getSerpHandler(): SerpHandler {
  return handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor:
          "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
      },
      ".ub-button": {
        color:
          "var(--ub-link-color, var(--color-categories-item-selected-font, #41a2ce))",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
      ".result-images": {
        padding: ".5rem .5rem 4.5rem .5rem",
      },
    },
    controlHandlers: [
      //#region simple theme
      // Global
      {
        target: ".search_filters",
        style: {
          marginTop: "8px",
          order: 1,
        },
      },
      //#endregion

      //#region oscar theme
      //Global
      {
        target: ".searx-navbar",
        style: {
          order: 1,
          color: "#fff", // Force white text
        },
      },
      {
        target: ".searxng-navbar",
        style: {
          order: 1,
          color: "#fff", // Force white text
        },
      },
      //#endregion

      //#region murena
      //Global
      {
        target: ".etheme_links",
        style: {
          order: 1,
        },
      },
      //#endregion
    ],
    entryHandlers: [
      // Web
      {
        target: ".result-default",
        url: "a",
        title: "h3",
        actionTarget: "a",
        actionStyle: {
          "&::before": {
            content: '" · "',
            padding: "0 2px 0 4px",
          },
          fontSize: "1rem",
        },
        props: {
          $category: "web",
        },
      },
      // Images
      {
        target: ".result-images",
        url: "a",
        title: ".title",
        actionTarget: "a",
        actionStyle: {
          fontSize: ".7em",
          display: "block",
          position: "absolute",
          padding: "3.1rem 0 0 0",
        },
        props: {
          $category: "images",
        },
      },
      // Videos
      {
        target: ".result-videos",
        url: "a",
        title: "h3",
        actionTarget: "a",
        actionStyle: {
          "&::before": {
            content: '" · "',
            padding: "0 2px 0 4px",
          },
          fontSize: "1rem",
        },
        props: {
          $category: "videos",
        },
      },
      // Maps
      {
        target: ".result-map",
        url: "a",
        title: "h3",
        actionTarget: "a",
        actionStyle: {
          "&::before": {
            content: '" · "',
            padding: "0 2px 0 4px",
          },
          fontSize: "1rem",
        },
        props: {
          $category: "map",
        },
      },
      // Files
      {
        target: ".result-torrent",
        url: "a",
        title: "h3",
        actionTarget: "a",
        actionStyle: {
          "&::before": {
            content: '" · "',
            padding: "0 2px 0 4px",
          },
          fontSize: "1rem",
        },
        props: {
          $category: "files",
        },
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
    pageProps: {
      $site: "searx",
    },
  });
}

export const searx: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.searx,
  getSerpHandler,
};

import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import { type CSSAttribute, css, glob } from "../styles.ts";
import type { SearchEngine } from "../types.ts";
import {
  getDialogThemeFromBody,
  handleSerp,
  insertElement,
} from "./helpers.ts";

function defaultControlStyle(
  style?: CSSAttribute,
): (root: HTMLElement) => void {
  return (root) => {
    const class_ = css({
      "&.msg": {
        margin: 0,
        maxWidth: "none",
        padding: "0.5em 10px",
        ...(style || {}),
      },
    });
    root.classList.add(class_, "msg");
  };
}

const serpHandler = handleSerp({
  globalStyle: (colors) => {
    glob({
      [[
        '[data-ub-blocked="visible"]',
        // Override !important selectors in All and News
        '.result.result.result.result.result[data-ub-blocked="visible"]',
        '[data-ub-blocked="visible"] + .result__sitelinks--organics',
        '[data-ub-blocked="visible"] .tile--img__sub',
      ].join(", ")]: {
        backgroundColor: `${
          colors.blockColor ?? "rgba(255, 192, 192, 0.5)"
        } !important`,
      },
      ...Object.fromEntries(
        colors.highlightColors.map((highlightColor, i) => [
          [
            `[data-ub-highlight="${i + 1}"]`,
            // Override !important selectors in All and News
            `.result.result.result.result.result[data-ub-highlight="${i + 1}"]`,
            `[data-ub-highlight="${i + 1}"] + .result__sitelinks--organics`,
            `[data-ub-highlight="${i + 1}"] .tile--img__sub`,
          ].join(", "),
          {
            backgroundColor: `${highlightColor} !important`,
          },
        ]),
      ),
      [[
        "[data-ub-blocked] .tile__media",
        "[data-ub-highlight] .tile__media",
        "[data-ub-blocked] .tile__body",
        "[data-ub-highlight] .tile__body",
        "[data-ub-blocked] :is(li > article)",
        "[data-ub-highlight] :is(li > article)",
      ].join(", ")]: {
        backgroundColor: "transparent !important",
      },
      '[data-ub-blocked="hidden"] + .result__sitelinks--organics': {
        display: "none !important",
      },
      ".ub-button.result__a": {
        ...(colors.linkColor != null
          ? { color: `${colors.linkColor} !important` }
          : {}),
        display: "inline",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
      // https://github.com/iorate/uBlacklist/issues/78
      ".is-mobile .result--news.result--img .result__extras": {
        bottom: "calc(2.1em + 2px) !important",
      },
    });
  },
  controlHandlers: [
    // All
    {
      scope: "all",
      target: "ol.react-results--main",
      position: "beforebegin",
      style: defaultControlStyle(),
      buttonStyle: "result__a",
    },
    // Images
    {
      scope: "images",
      target: "#zci-images",
      position: (target) => {
        const tileWrap = target.querySelector<HTMLElement>(".tile-wrap");
        return tileWrap && insertElement("span", tileWrap, "beforebegin");
      },
      style: defaultControlStyle({
        margin: "0 10px 0.5em",
      }),
      buttonStyle: "result__a",
    },
    // Videos
    {
      scope: "videos",
      target: "#zci-videos",
      position: (target) => {
        const tileWrap = target.querySelector<HTMLElement>(".tile-wrap");
        return tileWrap && insertElement("span", tileWrap, "beforebegin");
      },
      style: defaultControlStyle({
        margin: "0 10px 0.5em",
      }),
      buttonStyle: "result__a",
    },
    // News
    {
      scope: "news",
      target: ".vertical--news",
      position: (target) => {
        const message = target.querySelector<HTMLElement>(".results--message");
        return message && insertElement("span", message, "afterbegin");
      },
      style: defaultControlStyle(),
      buttonStyle: "result__a",
    },
  ],
  entryHandlers: [
    // All
    {
      scope: "all",
      target: "ol.react-results--main > li",
      url: 'a[data-testid="result-extras-url-link"]',
      title: 'a[data-testid="result-title-a"]',
      actionTarget: 'article[data-testid="result"]',
      actionStyle: {
        display: "block",
        marginTop: "2px",
        order: 3,
      },
      actionButtonStyle: "result__a",
      props: {
        $category: "web",
      },
    },
    // Images
    {
      scope: "images",
      target: ".tile--img",
      url: ".tile--img__sub",
      title: ".tile--img__title",
      actionTarget: ".tile--img__sub",
      actionStyle: {
        lineHeight: "1.5",
      },
      actionButtonStyle: "result__a",
      props: {
        $category: "images",
      },
    },
    // Videos
    {
      scope: "videos",
      target: ".tile--vid",
      url: ".tile__title > a",
      title: ".tile__title > a",
      actionTarget: ".tile__body",
      actionStyle: {
        display: "block",
        margin: "0.4em 0 -0.4em",
      },
      actionButtonStyle: "result__a",
      props: {
        $category: "videos",
      },
    },
    // News
    {
      scope: "news",
      target: ".result--news",
      url: ".result__a",
      title: ".result__a",
      actionTarget: ".result__body",
      actionStyle: {
        display: "block",
        marginTop: "2px",
        // https://github.com/iorate/uBlacklist/issues/78
        ".is-mobile .result--news.result--img &": {
          bottom: "calc(0.5em - 14px)",
          clear: "both",
          position: "relative",
        },
      },
      actionButtonStyle: "result__a",
      props: {
        $category: "news",
      },
    },
    // News Cards on the main page
    {
      scope: "all",
      target: ".module--carousel__item",
      url: "a",
      title: "a",
      actionPosition: "afterend",
      actionTarget: ".module--carousel__footer",
      actionStyle: (actionRoot) => {
        actionRoot.className = css({
          padding: "0 0.75em",
          position: "absolute",
          bottom: "6px",
          zIndex: "1",
          fontSize: "12px",
          ".is-mobile &": {
            padding: "0 16px",
          },
        });
        // Increase card size to include the "Block this site" button:
        actionRoot.closest(".module--carousel")?.classList.add(
          css({
            height: "unset !important",
            "& .module--carousel__items": {
              height: "320px",
            },
            "& .module--carousel__item": {
              height: "300px",
            },
            "& .module--carousel__footer": {
              bottom: "32px",
            },
          }),
        );
      },
      props: {
        $category: "web",
      },
    },
  ],
  pagerHandlers: [
    {
      target: "ol.react-results--main",
      innerTargets: "li",
    },
  ],
  getDialogTheme: getDialogThemeFromBody(),
  pageProps: {
    $site: "duckduckgo",
  },
});

const htmlSerpHandler = handleSerp({
  globalStyle: {
    '[data-ub-blocked="visible"]': {
      backgroundColor: "rgba(255, 192, 192, 0.5)",
    },
    ".ub-button": {
      color: "rgb(0, 39, 142)",
    },
    ".ub-button:hover": {
      textDecoration: "underline",
    },
  },
  controlHandlers: [
    {
      target: "#links",
      position: "afterbegin",
      style: {
        display: "block",
        marginBottom: "1em",
        padding: "0.5em 10px",
      },
    },
  ],
  entryHandlers: [
    {
      target: ".result",
      url: ".result__a",
      title: ".result__a",
      actionTarget: ".result__body",
      actionStyle: {
        display: "block",
        marginTop: "2px",
      },
    },
  ],
  pageProps: {
    $site: "duckduckgo",
    $category: "web",
  },
});

const liteSerpHandler = handleSerp({
  globalStyle: (colors) =>
    glob({
      ".ub-button": {
        color: "#1168cc",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
      '[data-ub-blocked="visible"], [data-ub-blocked="visible"] + tr, [data-ub-blocked="visible"] + tr + tr, [data-ub-blocked="visible"] + tr + tr + tr':
        {
          backgroundColor: "#ffc0c080",
        },
      '[data-ub-blocked="hidden"], [data-ub-blocked="hidden"] + tr, [data-ub-blocked="hidden"] + tr + tr, [data-ub-blocked="hidden"] + tr + tr + tr':
        {
          display: "none !important",
        },
      ...Object.fromEntries(
        colors.highlightColors.map((highlightColor, i) => [
          [
            `[data-ub-highlight="${i + 1}"]`,
            `[data-ub-highlight="${i + 1}"] + tr`,
            `[data-ub-highlight="${i + 1}"] + tr + tr`,
            `[data-ub-highlight="${i + 1}"] + tr + tr + tr`,
          ].join(", "),
          {
            backgroundColor: `${highlightColor} !important`,
          },
        ]),
      ),
    }),
  controlHandlers: [
    {
      target: (element) =>
        element instanceof HTMLTableElement &&
        element.querySelector(".result-link") != null,
      position: (target) => {
        const p = document.createElement("p");
        target.before(p);
        return p;
      },
    },
  ],
  entryHandlers: [
    {
      target: "tr",
      url: ".result-link",
      title: ".result-link",
      actionTarget: (root) => {
        const row = document.createElement("tr");
        root.nextElementSibling?.nextElementSibling?.after(row);
        row.insertCell().textContent = "\u00a0\u00a0\u00a0";
        return row.insertCell();
      },
      actionStyle: {
        fontSize: "77.4%",
      },
    },
  ],
  pageProps: {
    $site: "duckduckgo",
    $category: "web",
  },
});

export const duckduckgo: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.duckduckgo,
  getSerpHandler() {
    if (process.env.BROWSER === "chrome") {
      const { hostname } = new URL(window.location.href);
      return hostname === "html.duckduckgo.com"
        ? htmlSerpHandler
        : hostname === "lite.duckduckgo.com"
          ? liteSerpHandler
          : serpHandler;
    }
    return serpHandler;
  },
};

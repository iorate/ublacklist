import { type CSSAttribute, css } from "../styles.ts";
import type { SerpHandler } from "../types.ts";
import {
  type ControlHandler,
  type EntryHandler,
  handleSerp,
  hasDarkBackground,
  insertElement,
} from "./helpers.ts";

const desktopGlobalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor:
      "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
  },
  ".ub-button": {
    color: "var(--ub-link-color, rgb(26, 13, 171))",
  },
  '[data-ub-dark="1"] .ub-button': {
    color: "var(--ub-link-color, rgb(138, 180, 248))",
  },
  ".ub-button:hover": {
    textDecoration: "underline",
  },
};

function insertActionBeforeMenu(target: HTMLElement): HTMLElement | null {
  const menuParent = target.querySelector<HTMLElement>(
    ":scope > span:not([class])",
  );
  if (menuParent?.querySelector(".action-menu")?.querySelector("svg")) {
    return insertElement("span", menuParent, "beforebegin");
  }
  return insertElement("span", target, "beforeend");
}

const desktopActionStyle: CSSAttribute = {
  "&::before": {
    content: '" · "',
  },
};

const desktopRegularActionStyle: CSSAttribute = {
  "&::before": {
    content: '" · "',
    padding: "0 2px 0 4px",
  },
  // next to triangle
  ".eFM0qc > span:not([class]) + &::before": {
    content: "none",
    padding: 0,
  },
  fontSize: "14px",
  lineHeight: 1.3,
  visibility: "visible",
  // next to two-line header (`.TbwUpd.NJjxre.iUh30.ojE3Fb`)
  ".ojE3Fb + &": {
    fontSize: "12px",
    lineHeight: 1.5,
    marginTop: "20px",
  },
  // under two-line header
  ".ojE3Fb &": {
    fontSize: "12px",
    lineHeight: 1.5,
  },
  // next to "translate this page" (`.fl.iUh30`)
  ".fl + &": {
    paddingTop: "1px",
  },
  // next to "translate this language" under two-line header
  ".ojE3Fb .fl + &": {
    paddingTop: 0,
  },
};

const regularEntryHandler: Pick<
  EntryHandler,
  "actionTarget" | "actionPosition" | "actionStyle"
> = {
  // An entry has `a > .TbwUpd` and `div > .TbwUpd`...
  actionTarget: (root) =>
    root.querySelector(".eFM0qc") ||
    root.querySelector("div > .HGLrXd, div > .TbwUpd") ||
    root,
  actionPosition: (target) => {
    if (target.matches(".eFM0qc")) {
      if (process.env.BROWSER === "safari") {
        target.style.zIndex = "1";
      }
      return insertActionBeforeMenu(target);
    }
    if (target.matches(".HGLrXd, .TbwUpd")) {
      return insertElement("span", target, "afterend");
    }
    const actionRoot = insertElement("span", target, "beforeend");
    actionRoot.dataset.ubFallback = "1";
    return actionRoot;
  },
  actionStyle: (actionRoot) => {
    if (!actionRoot.dataset.ubFallback) {
      actionRoot.className = css(desktopRegularActionStyle);
    }
  },
};

const regularControlHandlers: ControlHandler[] = [
  {
    target: "#result-stats",
    style: {
      // Displays on the next line when part of the "Tools" bar
      "#hdtbMenus :is(.BfdGL.ZkEmPc + div) &": {
        display: "block",
      },
      "&:not(#hdtbMenus &)": {
        paddingLeft: "8px",
      },
    },
  },
  {
    target: "#slim_appbar:empty",
    style: (controlRoot) => {
      controlRoot.className = css({
        "#slim_appbar > &:not(:only-child)": {
          display: "none",
        },
      });
      // Set appropriate margin when "Tools" bar is present:
      controlRoot.closest("#appbar")?.classList.add(
        css({
          // Not present
          "&:not(.hdtb-ab-o)": {
            margin: "16px 0",
          },
          // Present
          "&:is(.hdtb-ab-o)": {
            margin: "42px 0 -12px",
          },
          // Remove margin when no entry has been blocked
          "&:has(.ub-hidden)": {
            margin: "0 !important",
          },
        }),
      );
      // Set appropriate margin when there is an additional labels bar
      if (controlRoot.matches(":is(:is(div + #tU52Vb) :scope)")) {
        controlRoot.closest("#appbar")?.classList.add(
          css({
            margin: "0 0 24px 0 !important",
          }),
        );
        controlRoot.closest("#slim_appbar")?.classList.add(
          css({
            ".hdtb-ab-o &": {
              padding: "48px 0 0 0",
            },
            padding: "24px 0 0 0",
          }),
        );
      }
    },
  },
];

const desktopSerpHandlers: Record<string, SerpHandler> = {
  // All
  "": handleSerp({
    globalStyle: {
      ...desktopGlobalStyle,
      [[
        ".dG2XIf", // Featured Snippet
        ".kno-fb-ctx", // Latest, Top Story (Horizontal)
        "g-inner-card", // Recipe
      ]
        .flatMap((s) => [`[data-ub-blocked] ${s}`, `[data-ub-highlight] ${s}`])
        .join(", ")]: {
        backgroundColor: "transparent !important",
      },
      // Remove remaining space when hiding nested results
      '.FxLDp:has(> .MYVUIe:only-child [data-ub-blocked="hidden"])': {
        display: "none",
      },
      // Hide overflowed actions in top stories
      ".OSrXXb": {
        whiteSpace: "nowrap",
      },
    },
    controlHandlers: [
      ...regularControlHandlers,
      {
        target: "#botabar",
        position: "afterend",
        style: {
          color: "rgb(112, 117, 122)",
          display: "block",
          margin: "-24px 0 24px 180px",
        },
      },
      {
        target: ".vI9alf",
        position: "afterend",
        style: {
          color: "rgb(112, 117, 122)",
          display: "block",
          margin: "0 0 16px 180px",
        },
      },
    ],
    entryHandlers: [
      // Regular, Web Result
      {
        // The first child should be the header...
        target:
          "[data-snf]:nth-child(2), [data-sokoban-feature]:nth-child(2), [data-content-feature]:nth-child(2)",
        level: 2,
        url: "a",
        title: "h3",
        ...regularEntryHandler,
      },
      {
        target: ".IsZvec",
        level: (target) => {
          const inner_g = target.closest<HTMLElement>(".g");
          if (!inner_g) {
            return null;
          }
          if (inner_g.matches(".related-question-pair *")) {
            // People Also Ask
            return null;
          }
          if (inner_g.matches(".VjDLd")) {
            // Knowledge Panel
            return null;
          }
          const outer_g = inner_g.parentElement?.closest<HTMLElement>(".g");
          if (!outer_g) {
            return inner_g;
          }
          if (outer_g.matches(".g-blk")) {
            // Featured Snippet
            return null;
          }
          if (outer_g.querySelector(":scope > h2")) {
            // Web Result with Sitelinks
            return outer_g;
          }
          return inner_g;
        },
        url: "a",
        title: "h3",
        ...regularEntryHandler,
      },
      // Discussions and forums
      {
        target: ".LJ7wUe",
        url: "a",
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".iDBaYb",
        actionStyle: {
          fontSize: "12px",
          margin: "0 0 0 -12px",
        },
      },
      // Featured Snippet
      {
        target: ".g .xpdopen .ifM9O .g",
        level: (target) =>
          // biome-ignore lint/style/noNonNullAssertion: `target` has an ancestor matching `.g`
          target.closest(".M8OgIe") || target.parentElement!.closest(".g"),
        url: ".yuRUbf a",
        title: "h3",
        ...regularEntryHandler,
      },
      // Latest, Top Story (Horizontal)
      {
        target: ".IJl0Z",
        url: "a",
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".OSrXXb",
        actionStyle: desktopActionStyle,
      },
      {
        target: ".JJZKK .kno-fb-ctx",
        level: ".JJZKK",
        url: "a",
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".OSrXXb",
        actionStyle: desktopActionStyle,
      },
      // People Also Ask
      {
        target: ".related-question-pair .g",
        level: ".related-question-pair",
        url: ".yuRUbf a",
        title: (root) => root.querySelector("h3")?.textContent ?? null,
        ...regularEntryHandler,
      },
      // Questions & answers
      {
        target: ".Hb5Kgc > .m9wSUc",
        level: ".Tpb3kb > .BmkBMc",
        url: "a",
        title: ".RqlTSb",
        actionTarget: ".m9wSUc",
        actionPosition: "afterend",
        actionStyle: (actionRoot) => {
          actionRoot.className = css({
            ...desktopActionStyle,
            display: "inline-block",
            fontSize: "14px",
            paddingLeft: "4px",
          });
          actionRoot.previousElementSibling?.classList.add(
            css({
              display: "inline-block !important",
            }),
          );
        },
      },
      // Quote in the News
      {
        target: ".UaDxmd > .F4CzCf",
        level: 1,
        url: ".YVkwvd",
        title: ".YVkwvd > div",
        actionTarget: ".FF4Vu",
        actionStyle: {
          display: "block",
          fontSize: "14px",
          lineHeight: "20px",
        },
      },
      // Recipe
      {
        target: ".YwonT",
        url: ".a-no-hover-decoration",
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".a-no-hover-decoration",
        actionStyle: {
          display: "block",
          fontSize: "12px",
        },
      },
      // Top Story (Vertical)
      {
        target: ".yG4QQe .WlydOe .OSrXXb",
        level: (target) => {
          if (target.matches(".JJZKK *")) {
            // Latest, Top story (Horizontal)
            return null;
          }
          // biome-ignore lint/style/noNonNullAssertion: `target` has an ancestor matching `.WlydOe`
          return target.closest(".WlydOe")!.parentElement;
        },
        url: ".WlydOe",
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".OSrXXb",
        actionStyle: (actionRoot) => {
          // biome-ignore lint/style/noNonNullAssertion: `actionRoot` has a parent
          actionRoot.parentElement!.style.whiteSpace = "nowrap";
          actionRoot.className = css(desktopActionStyle);
        },
      },
      // Medium size cards on Goggle card layout
      {
        target: ".e6hL7d:is(.WJXODe, .As9MV) > div:is(.GHMsie, .ZHugbd)",
        url: "a",
        title: (entryRoot) => {
          // If it is a specific kind of social media post, return @handle
          if (entryRoot.querySelector(".lt6hVb div.XwlO6c :is(g-img, img)")) {
            return (
              entryRoot.querySelector<HTMLElement>(".xxP3Ff > span")
                ?.textContent ?? null
            );
          }
          const elems = Array.from(
            entryRoot.querySelectorAll<HTMLElement>("div:not(:empty)"),
          );
          return (
            elems.find(
              (elem) => elem.childElementCount === 0 && elem.textContent,
            )?.textContent ?? null
          );
        },
        actionTarget: (entryRoot) => {
          const textContainer = entryRoot.querySelector<HTMLElement>(
            [
              ".rn876d.LLotyc",
              ".HDMle",
              ".g4Fgt",
              ".lt6hVb",
              ".p8o1rd",
              ".iUuXb",
              ".WpsIbd",
              ".FNMYpd",
            ].join(", "),
          );
          if (textContainer) {
            // Get empty slot to insert action button on full-width Instagram posts
            const emptySlot =
              textContainer.querySelector<HTMLElement>(".OpNfyc:empty");

            let dateContainer = textContainer.querySelector<HTMLElement>(
              ":scope > div:last-child",
            );
            if (!dateContainer?.querySelector(":scope > span")) {
              dateContainer = null;
            }

            const nestedSpan = dateContainer?.querySelector<HTMLElement>(
              ".xH3xue:last-of-type",
            );

            return emptySlot ?? nestedSpan ?? dateContainer ?? textContainer;
          }
          return null;
        },
        actionStyle: (actionRoot) => {
          const commonStyle: CSSAttribute = {
            position: "relative",
            zIndex: "1",
          };
          actionRoot.className = css(
            actionRoot.matches("span + span, span > :scope")
              ? // Add a " · " separator to elements that come after a date
                {
                  ...commonStyle,
                  ...desktopActionStyle,
                  paddingLeft: "1px",
                }
              : {
                  ...commonStyle,
                  fontSize: "12px",
                },
          );
          // Make so that text doesn't wrap when container is too tight
          actionRoot.parentElement?.classList.add(
            css({
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }),
          );
          // Make action clickable on YT videos that occupy all the available space
          if (
            actionRoot
              .closest(".p8o1rd")
              ?.parentElement?.querySelector(".MhN3hd")
          ) {
            actionRoot.parentElement?.style.setProperty("z-index", "1");
            actionRoot.setAttribute("data-ub-dark", "1");
          }
          // Copy container style in order to fit the action on Instagram posts that
          // take all the available space.
          if (actionRoot.matches(".OpNfyc > :scope")) {
            actionRoot.classList.add("ryUkQc");
            actionRoot.parentElement?.style.setProperty(
              "background-color",
              "rgba(0, 0, 0, 0.7)",
              "important",
            );
          }
        },
      },
      // Small cards
      {
        target: ".e6hL7d:is(.WJXODe, .As9MV) > .I48dHb",
        url: "a",
        title: ".QzAn5, .F6sHsf",
        actionTarget: ".N0RSzc, .QzAn5, .cHaqb",
        actionPosition: "afterend",
        actionStyle: {
          padding: "0 12px",
          fontSize: "10px",
          marginBottom: "-6px",
          position: "relative",
          zIndex: "1",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        },
      },
      // Twitter, Twitter Search
      {
        target: ".eejeod",
        url: "g-link > a",
        title: "a > h3",
        actionTarget: (root) => {
          const aboutThisResult =
            root.querySelector<HTMLElement>(".ellip > .hzVK5c");
          return aboutThisResult
            ? aboutThisResult.parentElement
            : root.querySelector(".ellip");
        },
        actionPosition: (target) => {
          const aboutThisResult =
            target.querySelector<HTMLElement>(":scope > .hzVK5c");
          return aboutThisResult
            ? insertElement("span", aboutThisResult, "beforebegin")
            : insertElement("span", target, "beforeend");
        },
        actionStyle: (actionRoot) => {
          actionRoot.className = css(
            actionRoot.matches(".Y3iVZd *")
              ? // With "About this result" and single tweet
                {
                  ...desktopRegularActionStyle,
                  display: "inline-block",
                  marginTop: "7px",
                }
              : {
                  ...desktopRegularActionStyle,
                  bottom: "7px",
                  fontSize: "12px",
                  position: "relative",
                  zIndex: 1,
                },
          );
        },
      },
      // Video
      {
        target: ".iHxmLe",
        level: ".g",
        url: "a",
        title: "h3",
        ...regularEntryHandler,
      },
      {
        target: ".RzdJxc .OwbDmd",
        level: ".RzdJxc",
        url: 'a:not([href="#"])',
        title: ".fc9yUc",
        actionTarget: ".OwbDmd",
        actionStyle: desktopActionStyle,
      },
      // YouTube and TikTok Channel
      {
        target: ".d3zsgb, .rULfzc",
        level: 1,
        url: "a",
        title: "h3",
        ...regularEntryHandler,
      },
      // News (COVID-19)
      {
        target:
          ".XXW1wb .WlydOe .ZE0LJd, .XXW1wb .WlydOe .S1FAPd, .ftSUBd .WlydOe .ZE0LJd, .ftSUBd .WlydOe .S1FAPd",
        level: (target) =>
          target.closest(".ftSUBd") || target.closest(".WlydOe"),
        url: (root) => {
          const a = root.matches(".ftSUBd")
            ? root.querySelector<HTMLElement>(".WlydOe")
            : root;
          return a instanceof HTMLAnchorElement ? a.href : null;
        },
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".ZE0LJd, .S1FAPd",
        actionStyle: desktopActionStyle,
      },
      // Images (on the "All" page)
      {
        target: ".eA0Zlc.mkpRId.RLdvSe",
        url: "a",
        title: ".toI8Rb",
        actionTarget: ".guK3rf",
        actionStyle: {
          ...desktopActionStyle,
          position: "relative",
          zIndex: "1",
        },
      },
    ],
    pagerHandlers: [
      // People Also Ask
      {
        target: '.IZE3Td, [jsname="Cpkphb"]',
        innerTargets: ".g",
      },
      // Recipe, Regular (COVID-19), Web Result (COVID-19), ...
      {
        target: ".yl > div",
        innerTargets:
          ".YwonT, [data-snf], [data-sokoban-feature], [data-content-feature], .IsZvec, .kno-fb-ctx, .ZE0LJd, .S1FAPd, .g, .F9rcV, .hMJ0yc",
      },
      // AutoPagerize and Continuous scrolling (US)
      {
        target: '.autopagerize_page_info ~ div, [id^="arc-srp"] > div',
        // Regular, Video, and YouTube and TikTok channel
        innerTargets:
          "[data-snf], [data-sokoban-feature], [data-content-feature], .IsZvec, .g, .iHxmLe, .d3zsgb, .rULfzc, .eA0Zlc.mkpRId.RLdvSe",
      },
      // Card layout dynamic switching
      {
        target: '[id^="stev-stapi"], [id^="stev-stapi"] > div',
        innerTargets: ".I48dHb, .GHMsie, .ZHugbd",
      },
    ],
    pageProps: {
      $site: "google",
      $category: "web",
    },
  }),
  // Books
  bks: handleSerp({
    globalStyle: desktopGlobalStyle,
    controlHandlers: [...regularControlHandlers],
    entryHandlers: [
      {
        target: ".Yr5TG",
        url: ".bHexk > a",
        title: "h3",
        actionTarget: ".eFM0qc",
        actionPosition: insertActionBeforeMenu,
        actionStyle: desktopRegularActionStyle,
      },
    ],
    pageProps: {
      $site: "google",
      $category: "books",
    },
  }),
  // Images
  "udm=2": handleSerp({
    globalStyle: desktopGlobalStyle,
    controlHandlers: [
      {
        target: "#hdtbMenus",
        style: {
          lineHeight: "22px",
        },
      },
      {
        target: "#hdtb-sc > .PHj8of",
        style: {
          display: "block",
          margin: "5px 0",
          paddingLeft: "1.5rem",
        },
      },
    ],
    entryHandlers: [
      {
        target: ".ivg-i",
        url: "a[href]",
        title: ".OSrXXb",
        actionTarget: "",
        actionStyle: {
          display: "block",
          fontSize: "11px",
          paddingLeft: "4px",
        },
      },
      {
        target: ".isv-r",
        url: "a:not([role='button'])",
        actionTarget: (root) => root,
        actionStyle: {
          display: "block",
          fontSize: "12px",
          lineHeight: "18px",
          margin: "-2px 0 8px",
        },
      },
    ],
    pagerHandlers: [
      {
        target: "c-wiz",
        innerTargets: ".isv-r",
      },
    ],
    pageProps: {
      $site: "google",
      $category: "images",
    },
  }),
  isch: handleSerp({
    globalStyle: desktopGlobalStyle,
    controlHandlers: [
      {
        target: ".cEPPT",
        position: "afterend",
        style: {
          "html[data-ub-dark='1'] &": {
            color: "rgb(154, 160, 166)",
          },
          color: "#70757a",
          display: "block",
          padding: "0 0 11px 165px",
        },
      },
      {
        target: ".ECgenc .itb-h",
        style: {
          "html[data-ub-dark='1'] &": {
            color: "rgb(154, 160, 166)",
          },
          color: "#70757a",
          padding: "6px 0 0 18px",
        },
      },
    ],
    entryHandlers: [
      {
        target: '.isv-r[role="listitem"]',
        url: 'a:not([role="button"])',
        title: (root) => {
          const a = root.querySelector<HTMLElement>('a:not([role="button"])');
          return a?.title ?? null;
        },
        actionTarget: "",
        actionStyle: {
          display: "block",
          fontSize: "11px",
        },
      },
    ],
    pageProps: {
      $site: "google",
      $category: "images",
    },
  }),
  // News
  nws: handleSerp({
    globalStyle: {
      ...desktopGlobalStyle,
      "[data-ub-blocked] .kno-fb-ctx, [data-ub-highlight] .kno-fb-ctx": {
        backgroundColor: "transparent !important",
      },
      // Hide overflowed actions
      ".OSrXXb": {
        whiteSpace: "nowrap",
      },
    },
    controlHandlers: [...regularControlHandlers],
    entryHandlers: [
      // Regular
      {
        target: ".SoaBEf, .JJZKK",
        url: "a",
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".OSrXXb",
        actionStyle: desktopActionStyle,
      },
      {
        target: ".WlydOe .ZE0LJd, .WlydOe .S1FAPd",
        level: (target) =>
          target.closest(".ftSUBd") || target.closest(".WlydOe"),
        url: (root) => {
          const a = root.matches(".ftSUBd")
            ? root.querySelector<HTMLElement>(".WlydOe")
            : root;
          return a instanceof HTMLAnchorElement ? a.href : null;
        },
        title: '[role="heading"][aria-level="3"]',
        actionTarget: ".ZE0LJd, .S1FAPd",
        actionStyle: desktopActionStyle,
      },
      // People Also Search For
      {
        target: ".F9rcV",
        url: ".Tsx23b",
        title: ".I1HL6b",
        actionTarget: ".Tsx23b",
        actionStyle: {
          display: "block",
          fontSize: "12px",
          margin: "-12px 0 12px",
          padding: "0 16px",
        },
      },
    ],
    pagerHandlers: [
      // AutoPagerize
      {
        target: ".autopagerize_page_info ~ div",
        innerTargets: ".SoaBEf, .JJZKK, .ZE0LJd, .S1FAPd",
      },
    ],
    pageProps: {
      $site: "google",
      $category: "news",
    },
  }),
  // Videos
  vid: handleSerp({
    globalStyle: desktopGlobalStyle,
    controlHandlers: [...regularControlHandlers],
    entryHandlers: [
      {
        target: ".g, .iHxmLe",
        level: ".g",
        url: "a",
        title: "h3",
        ...regularEntryHandler,
      },
    ],
    pagerHandlers: [
      // AutoPagerize
      {
        target: ".autopagerize_page_info ~ div",
        innerTargets: ".g",
      },
    ],
    pageProps: {
      $site: "google",
      $category: "videos",
    },
  }),
};

function updateDarkMode(): void {
  if (!document.body) {
    return;
  }
  if (hasDarkBackground(document.body)) {
    document.documentElement.dataset.ubDark = "1";
  } else {
    delete document.documentElement.dataset.ubDark;
  }
}

export function getDesktopSerpHandler(
  tbm: string,
  udm: string,
): SerpHandler | null {
  const udmKey = `udm=${udm}`;
  const serpHandler =
    desktopSerpHandlers[udmKey in desktopSerpHandlers ? udmKey : tbm];
  if (!serpHandler) {
    return null;
  }
  return {
    ...serpHandler,
    onSerpStart: () => {
      updateDarkMode();
      return serpHandler.onSerpStart();
    },
    onSerpElement: (element) => {
      if (
        (element instanceof HTMLLinkElement &&
          element.relList.contains("stylesheet")) ||
        element instanceof HTMLStyleElement ||
        element === document.body
      ) {
        updateDarkMode();
      }
      return serpHandler.onSerpElement(element);
    },
    getDialogTheme: () =>
      document.documentElement.dataset.ubDark === "1" ? "dark" : "light",
  };
}

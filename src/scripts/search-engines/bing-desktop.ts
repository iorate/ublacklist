import { z } from "zod";
import { type CSSAttribute, css } from "../styles.ts";
import type { SerpHandler } from "../types.ts";
import { parseJSON } from "../utilities.ts";
import { getParentElement, handleSerp } from "./helpers.ts";

const globalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor:
      "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
  },
  ".ub-button": {
    color: "var(--ub-link-color, rgb(26, 13, 171))",
  },
  ".ub-button:hover": {
    textDecoration: "underline",
  },
};

const controlStyle: CSSAttribute = {
  display: "block",
  fontSize: "14px",
  lineHeight: 2.5,
};

const serpHandlers: Readonly<Record<string, SerpHandler | undefined>> = {
  "/search": handleSerp({
    globalStyle,
    controlHandlers: [
      {
        target: "#b_results",
        position: "beforebegin",
        style: {
          ...controlStyle,
          marginLeft: "20px",
        },
      },
    ],
    entryHandlers: [
      {
        target: ".b_algo",
        url: (root) => {
          const url = root.querySelector<HTMLAnchorElement>("h2 > a")?.href;
          if (!url) {
            return null;
          }
          if (url.startsWith("https://www.bing.com/ck/")) {
            // "Open links in new tab" is turned on
            // Get the URL from the <cite> element
            const citeURL = root.querySelector("cite")?.textContent;
            if (citeURL == null) {
              return null;
            }
            try {
              return new URL(citeURL).toString();
            } catch {
              return null;
            }
          }
          return url;
        },
        title: "h2",
        actionTarget: ".b_attribution",
        actionStyle: {
          display: "inline-block",
          width: 0,
          "cite + &, a:not(.trgr_icon) + &": {
            marginLeft: "6px",
          },
        },
      },
    ],
    pageProps: {
      $site: "bing",
      $category: "web",
    },
  }),
  "/images/search": handleSerp({
    globalStyle: {
      ".ub-button": {
        color: "var(--ub-link-color, rgb(26, 13, 171))",
      },
      ".ub-button:hover": {
        textDecoration: "underline",
      },
    },
    controlHandlers: [
      {
        target: ".dg_b",
        position: "beforebegin",
        style: {
          ...controlStyle,
          marginLeft: "10px",
        },
      },
    ],
    entryHandlers: [
      {
        target: ".infnmpt > .infsd, .img_info > .lnkw",
        level: ".dgControl_list > li",
        url: (root) => {
          const m = root.querySelector<HTMLElement>(".iusc")?.getAttribute("m");
          if (m == null) {
            return null;
          }
          const parseResult = z
            .object({ purl: z.string() })
            .safeParse(parseJSON(m));
          if (!parseResult.success) {
            return null;
          }
          return parseResult.data.purl;
        },
        title: (root) => {
          const m = root.querySelector<HTMLElement>(".iusc")?.getAttribute("m");
          if (m == null) {
            return null;
          }
          const parseResult = z
            .object({ t: z.string() })
            .safeParse(parseJSON(m));
          if (!parseResult.success) {
            return null;
          }
          return parseResult.data.t;
        },
        actionTarget: (root) =>
          root.querySelector<HTMLElement>(".infnmpt") ??
          root.querySelector<HTMLElement>(".img_info"),
        actionStyle: (actionRoot) => {
          const actionTarget = getParentElement(actionRoot);
          if (actionTarget.matches(".infnmpt")) {
            actionRoot.closest<HTMLElement>(".infopt")?.classList.add(
              css({
                '[data-ub-blocked="visible"] &': {
                  backgroundColor:
                    "var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important",
                },
              }),
            );
            actionRoot.className = css({
              display: "block",
              fontSize: "11px",
              lineHeight: "16px",
              marginTop: "-8px",
              overflow: "hidden",
              paddingBottom: "8px",
              pointerEvents: "auto",
              textOverflow: "ellipsis",
            });
          } else {
            actionRoot.closest<HTMLElement>(".imgpt")?.classList.add(
              css({
                '[data-ub-blocked="visible"] &': {
                  boxShadow: "0 0 0 12px rgba(255, 192, 192, 0.5)",
                },
              }),
            );
            actionTarget.classList.add(
              css({
                height: "49.2px !important",
              }),
            );
            actionRoot.className = css({
              pointerEvents: "auto",
              "& .ub-button": {
                color: "var(--ub-link-color, inherit)",
              },
            });
          }
        },
      },
    ],
    pagerHandlers: [
      {
        target: ".dgControl_list, .dgControl_list > li",
        innerTargets: ".infsd, .lnkw",
      },
      {
        target: "#b_content",
        innerTargets: ".dg_b, .infsd, .lnkw",
      },
    ],
    pageProps: {
      $site: "bing",
      $category: "images",
    },
  }),
  "/videos/search": handleSerp({
    globalStyle: {
      ...globalStyle,
      "[data-ub-blocked] .mc_vtvc, [data-ub-blocked] .mc_vtvc_meta, [data-ub-highlight] .mc_vtvc, [data-ub-highlight] .mc_vtvc_meta":
        {
          backgroundColor: "transparent !important",
        },
      "[data-ub-blocked] .mc_vtvc_meta_bg_w img, [data-ub-highlight] .mc_vtvc_meta_bg_w img":
        {
          visibility: "hidden",
        },
      ".dg_u": {
        height: "284px !important",
      },
      ".mc_vtvc_meta_w": {
        height: "119px !important",
      },
    },
    controlHandlers: [
      {
        target: "#vm_res",
        position: "beforebegin",
        style: {
          ...controlStyle,
          marginLeft: "160px",
        },
      },
    ],
    entryHandlers: [
      {
        target: ".dg_u",
        url: (root) => {
          const vrhm = root
            .querySelector<HTMLElement>(".vrhdata")
            ?.getAttribute("vrhm");
          if (vrhm == null) {
            return null;
          }
          const parseResult = z
            .object({ murl: z.string() })
            .safeParse(parseJSON(vrhm));
          if (!parseResult.success) {
            return null;
          }
          return parseResult.data.murl;
        },
        title: ".mc_vtvc_title",
        actionTarget: ".mc_vtvc_meta",
        actionStyle: {
          display: "block",
        },
      },
    ],
    pagerHandlers: [
      {
        target: ".dg_b",
        innerTargets: ".dg_u",
      },
      {
        target: "#b_content",
        innerTargets: "#vm_res, .dg_u",
      },
    ],
    pageProps: {
      $site: "bing",
      $category: "videos",
    },
  }),
  "/news/search": handleSerp({
    globalStyle,
    controlHandlers: [
      {
        target: "#contentid",
        position: "afterbegin",
        style: {
          display: "block",
          marginBottom: "20px",
        },
      },
    ],
    entryHandlers: [
      {
        target: ".source",
        level: (target) => {
          const newsCard = target.closest<HTMLElement>(".news-card");
          return newsCard?.querySelector(".generalads") ? null : newsCard;
        },
        url: ".title",
        title: ".title",
        actionTarget: ".source",
        actionStyle: {
          marginLeft: "6px",
          flex: "0 100000 auto !important",
        },
      },
    ],
    pagerHandlers: [
      {
        target: ".news-card",
        innerTargets: ".source",
      },
    ],
    pageProps: {
      $site: "bing",
      $category: "news",
    },
  }),
};

export function getDesktopSerpHandler(path: string): SerpHandler | null {
  return serpHandlers[path] || null;
}

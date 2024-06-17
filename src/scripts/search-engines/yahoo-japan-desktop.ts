import type { SerpHandler } from "../types.ts";
import { handleSerp } from "./helpers.ts";

const webHandler = handleSerp({
  globalStyle: {
    '[data-ub-blocked="visible"]': {
      backgroundColor: "var(--ub-block-color, rgba(255, 192, 192, 0.5))",
    },
    ".ub-button": {
      color: "var(--ub-link-color, var(--color-link, #000d99))",
      textDecoration: "underline",
    },
    ".ub-button:hover": {
      color: "#cc3434",
    },
  },
  controlHandlers: [
    {
      target: ".Hits__item",
      style: {
        color: "#666",
        marginLeft: "8px",
      },
    },
  ],
  entryHandlers: [
    {
      target: ".sw-CardBase",
      url: ".sw-Card__titleInner",
      title: ".sw-Card__titleMain",
      actionTarget: ".sw-Card__floatContainer",
      actionStyle: {
        fontSize: "1.4rem",
        lineHeight: 1.4,
      },
    },
  ],
  pageProps: {
    $site: "yahooJapan",
    $category: "web",
  },
});

const handlers: Readonly<Record<string, SerpHandler | undefined>> = {
  // Web
  "/search": webHandler,
};

export const getDesktopSerpHandler = (path: string): SerpHandler | null => {
  return handlers[path] ?? null;
};

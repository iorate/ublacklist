import type { SerpHandler } from "../types.ts";
import { handleSerp } from "./helpers.ts";

const webHandler = handleSerp({
  globalStyle: {
    '[data-ub-blocked="visible"]': {
      backgroundColor: "var(--ub-block-color, rgba(255, 192, 192, 0.5))",
    },
    ".ub-button": {
      color: "var(--ub-link-color, var(--color-link, #000d99))",
    },
  },
  controlHandlers: [
    {
      target: ".SearchTool",
      style: {
        color: "#666",
      },
    },
  ],
  entryHandlers: [
    {
      target: ".sw-CardBase",
      url: ".sw-Card__space",
      title: ".sw-Card__titleMain",
      actionTarget: ".sw-Card__floatContainer",
      actionStyle: {
        fontSize: "12px",
        lineHeight: 1.6,
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

export const getMobileSerpHandler = (path: string): SerpHandler | null => {
  return handlers[path] ?? null;
};

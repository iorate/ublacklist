import mobile from "is-mobile";
import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import type { SearchEngine } from "../types.ts";
import { getDesktopSerpHandler } from "./bing-desktop.ts";
import { getMobileSerpHandler } from "./bing-mobile.ts";

export const bing: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.bing,
  getSerpHandler() {
    const path = new URL(window.location.href).pathname;
    return mobile({ tablet: true })
      ? getMobileSerpHandler(path)
      : getDesktopSerpHandler(path);
  },
};

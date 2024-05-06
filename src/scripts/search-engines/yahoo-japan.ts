import mobile from "is-mobile";
import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import type { SearchEngine } from "../types.ts";
import { getDesktopSerpHandler } from "./yahoo-japan-desktop.ts";
import { getMobileSerpHandler } from "./yahoo-japan-mobile.ts";

export const yahooJapan: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.yahooJapan,
  getSerpHandler() {
    const { pathname } = new URL(window.location.href);
    return mobile({ tablet: false })
      ? getMobileSerpHandler(pathname)
      : getDesktopSerpHandler(pathname);
  },
};

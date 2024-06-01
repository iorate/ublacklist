import mobile from "is-mobile";
import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import type { SearchEngine } from "../types.ts";
import { getDesktopSerpHandler } from "./google-desktop.ts";
import { getMobileSerpHandler } from "./google-mobile.ts";

export const google: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.google,
  getSerpHandler() {
    const params = new URL(window.location.href).searchParams;
    const tbm = params.get("tbm") ?? "";
    const udm = params.get("udm") ?? "";
    return mobile({ tablet: true })
      ? getMobileSerpHandler(tbm, udm)
      : getDesktopSerpHandler(tbm, udm);
  },
};

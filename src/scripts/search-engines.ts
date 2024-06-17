import { bing } from "./search-engines/bing.ts";
import { brave } from "./search-engines/brave.ts";
import { duckduckgo } from "./search-engines/duckduckgo.ts";
import { ecosia } from "./search-engines/ecosia.ts";
import { google } from "./search-engines/google.ts";
import { kagi } from "./search-engines/kagi.ts";
import { qwant } from "./search-engines/qwant.ts";
import { searx } from "./search-engines/searx.ts";
import { startpage } from "./search-engines/startpage.ts";
import { yahooJapan } from "./search-engines/yahoo-japan.ts";
import { yandex } from "./search-engines/yandex.ts";
import type { SearchEngine, SearchEngineId } from "./types.ts";

export const SEARCH_ENGINES: Readonly<
  Record<SearchEngineId, Readonly<SearchEngine>>
> = {
  google,
  bing,
  brave,
  duckduckgo,
  ecosia,
  kagi,
  qwant,
  searx,
  startpage,
  yahooJapan,
  yandex,
};

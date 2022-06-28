import { bing } from './search-engines/bing';
import { brave } from './search-engines/brave';
import { duckduckgo } from './search-engines/duckduckgo';
import { ecosia } from './search-engines/ecosia';
import { google } from './search-engines/google';
import { qwant } from './search-engines/qwant';
import { searxng } from './search-engines/searxng';
import { startpage } from './search-engines/startpage';
import { yahooJapan } from './search-engines/yahoo-japan';
import { yandex } from './search-engines/yandex';
import { SearchEngine, SearchEngineId } from './types';

export const SEARCH_ENGINES: Readonly<Record<SearchEngineId, Readonly<SearchEngine>>> = {
  google,
  bing,
  brave,
  duckduckgo,
  ecosia,
  qwant,
  searxng,
  startpage,
  yahooJapan,
  yandex,
};

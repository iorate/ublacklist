import { bing } from './search-engines/bing';
import { duckduckgo } from './search-engines/duckduckgo';
import { ecosia } from './search-engines/ecosia';
import { google } from './search-engines/google';
import { qwant } from './search-engines/qwant';
import { startpage } from './search-engines/startpage';
import { SearchEngine, SearchEngineId } from './types';

export const SEARCH_ENGINES: Readonly<Record<SearchEngineId, Readonly<SearchEngine>>> = {
  google,
  bing,
  duckduckgo,
  ecosia,
  qwant,
  startpage,
};

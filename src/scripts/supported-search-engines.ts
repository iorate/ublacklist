import { ecosia } from './search-engines/ecosia';
import { duckduckgo } from './search-engines/duckduckgo';
import { google } from './search-engines/google';
import { startpage } from './search-engines/startpage';
import { SearchEngines } from './types';

export const supportedSearchEngines: SearchEngines = {
  google,
  duckduckgo,
  startpage,
  ecosia,
};

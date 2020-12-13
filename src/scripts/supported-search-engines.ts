import { duckduckgo } from './search-engines/duckduckgo';
import { ecosia } from './search-engines/ecosia';
import { google } from './search-engines/google';
import { startpage } from './search-engines/startpage';
import { SearchEngines } from './types';

export const supportedSearchEngines: SearchEngines = {
  google,
  duckduckgo,
  ecosia,
  startpage,
};

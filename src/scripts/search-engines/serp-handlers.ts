import { SearchEngineId, SerpHandler } from '../types';
import { getSerpHandler as bingSerpHandler } from './bing';
import { getSerpHandler as duckduckgoSerpHandler } from './duckduckgo';
import { getSerpHandler as ecosiaSerpHandler } from './ecosia';
import { getSerpHandler as googleSerpHandler } from './google';
import { getSerpHandler as qwantSerpHandler } from './qwant';
import { getSerpHandler as startpageSerpHandler } from './startpage';

export const searchEngineSerpHandlers: Readonly<Record<SearchEngineId, () => SerpHandler | null>> =
  {
    google: googleSerpHandler,
    bing: bingSerpHandler,
    duckduckgo: duckduckgoSerpHandler,
    ecosia: ecosiaSerpHandler,
    qwant: qwantSerpHandler,
    startpage: startpageSerpHandler,
  };

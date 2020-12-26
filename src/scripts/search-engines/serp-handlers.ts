import { SearchEngineId, SerpHandler } from '../types';
import { getSerpHandler as duckduckgoSerpHandler } from './duckduckgo';
import { getSerpHandler as ecosiaSerpHandler } from './ecosia';
import { getSerpHandler as googleSerpHandler } from './google';
import { getSerpHandler as startpageSerpHandler } from './startpage';

export const searchEngineSerpHandlers: Readonly<
  Record<SearchEngineId, () => SerpHandler | null>
> = {
  google: googleSerpHandler,
  duckduckgo: duckduckgoSerpHandler,
  ecosia: ecosiaSerpHandler,
  startpage: startpageSerpHandler,
};

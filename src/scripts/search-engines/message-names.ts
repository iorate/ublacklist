import { MessageName0, SearchEngineId } from '../types';

export const searchEngineMessageNames: Readonly<Record<SearchEngineId, { name: MessageName0 }>> = {
  google: {
    name: 'searchEngines_googleName',
  },
  duckduckgo: {
    name: 'searchEngines_duckduckgoName',
  },
  ecosia: {
    name: 'searchEngines_ecosiaName',
  },
  startpage: {
    name: 'searchEngines_startpageName',
  },
};

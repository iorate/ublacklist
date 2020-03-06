import { Engine } from './types';

export const ENGINES: Engine[] = [
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    matches: [
      '*://duckduckgo.com/?*',
      '*://duckduckgo.com//',
      '*://safe.duckduckgo.com/?*',
      '*://safe.duckduckgo.com//',
      '*://start.duckduckgo.com/?*',
      '*://start.duckduckgo.com//',
    ],
  },
  {
    id: 'startpage',
    name: 'Startpage.com',
    matches: [
      'https://startpage.com/do/*',
      'https://startpage.com/sp/*',
      'https://www.startpage.com/do/*',
      'https://www.startpage.com/rvd/*',
      'https://www.startpage.com/sp/*',
    ],
  },
];

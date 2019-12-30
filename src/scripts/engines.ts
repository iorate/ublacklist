import { Engine } from './types';

export const ENGINES: Engine[] = [
  {
    id: 'startpage',
    name: 'Startpage.com',
    matches: [
      'https://www.startpage.com/do/dsearch?*',
      'https://www.startpage.com/do/metasearch.pl?*',
      'https://www.startpage.com/do/search',
      'https://www.startpage.com/do/search?*',
      'https://www.startpage.com/rvd/search?*',
      'https://www.startpage.com/sp/search',
      'https://www.startpage.com/sp/search?*',
    ],
  },
];

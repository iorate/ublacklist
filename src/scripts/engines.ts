import { Engine } from './common';

export const ENGINES: Engine[] = [
  {
    id: 'startpage',
    matches: [
      'https://www.startpage.com/do/search',
      'https://www.startpage.com/rvd/search',
      'https://www.startpage.com/sp/search',
    ],
    name: 'Startpage.com',
  },
];

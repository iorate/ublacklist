import mobile from 'is-mobile';
import { SEARCH_ENGINES } from '../../common/search-engines';
import { SearchEngine } from '../types';
import { getDesktopSerpHandler } from './google-desktop';
import { getMobileSerpHandler } from './google-mobile';

export const google: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.google,
  messageNames: {
    name: 'searchEngines_googleName',
  },
  getSerpHandler() {
    const tbm = new URL(window.location.href).searchParams.get('tbm') ?? '';
    return mobile({ tablet: true }) ? getMobileSerpHandler(tbm) : getDesktopSerpHandler(tbm);
  },
};

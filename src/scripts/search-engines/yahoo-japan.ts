import mobile from 'is-mobile';
import { SEARCH_ENGINES } from '../../common/search-engines';
import type { SearchEngine } from '../types';
import { getDesktopSerpHandler } from './yahoo-japan-desktop';
import { getMobileSerpHandler } from './yahoo-japan-mobile';

export const yahooJapan: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.yahooJapan,
  getSerpHandler() {
    const { pathname } = new URL(window.location.href);
    return mobile({ tablet: false })
      ? getMobileSerpHandler(pathname)
      : getDesktopSerpHandler(pathname);
  },
};

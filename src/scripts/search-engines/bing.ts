import mobile from 'is-mobile';
import { SEARCH_ENGINES } from '../../common/search-engines';
import { SearchEngine } from '../types';
import { getDesktopSerpHandler } from './bing-desktop';
import { getMobileSerpHandler } from './bing-mobile';

export const bing: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.bing,
  getSerpHandler() {
    const path = new URL(window.location.href).pathname;
    return mobile({ tablet: true }) ? getMobileSerpHandler(path) : getDesktopSerpHandler(path);
  },
};

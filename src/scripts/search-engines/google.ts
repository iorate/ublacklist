import mobile from 'is-mobile';
import { SEARCH_ENGINES } from '../../common/search-engines';
import { SearchEngine } from '../types';
import { getDesktopSerpHandler } from './google-desktop';
import { getMobileSerpHandler } from './google-mobile';

export const google: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.google,
  getSerpHandler() {
    const params = new URL(window.location.href).searchParams;
    const tbm = params.get('tbm') ?? '';
    const udm = params.get('udm') ?? '';
    return mobile({ tablet: true }) ? getMobileSerpHandler(tbm) : getDesktopSerpHandler(tbm, udm);
  },
};

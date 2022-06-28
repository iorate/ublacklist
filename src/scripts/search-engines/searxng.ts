import { SEARCH_ENGINES } from '../../common/search-engines';
import { SearchEngine, SerpHandler } from '../types';
import { getDialogThemeFromBody, handleSerp } from './helpers';

function getSerpHandler(): SerpHandler {
  return handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
      },
      '.ub-button': {
        color: 'var(--ub-link-color, var(--color-url-font))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
    },
    controlHandlers: [
      {
        target: '.search_filters',
        style: {
          height: '2.4rem',
        },
      },
    ],
    entryHandlers: [
      // Web
      {
        target: '#urls > .result',
        url: 'a',
        title: 'h3',
        actionTarget: '.url_wrapper',
        actionStyle: {
          fontSize: '.9em',
        },
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  });
}

export const searxng: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.searxng,
  getSerpHandler,
};

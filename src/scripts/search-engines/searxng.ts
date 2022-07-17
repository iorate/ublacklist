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
      // Web (Simple Theme)
      {
        target: '.search_filters',
        style: {
          height: '2.4rem',
        },
      },
      // Web (Oscar Theme)
      {
        target: '#search_form',
        style: {
          height: '1.2rem',
          textTransform: 'none',
        },
      },
    ],
    entryHandlers: [
      // Web (Simple Theme)
      {
        target: '#urls > .result',
        url: 'a',
        title: 'h3',
        actionTarget: '.url_wrapper',
        actionStyle: {
          fontSize: '.9em',
        },
      },
      // Web (Oscar theme)
      {
        target: '#main_results > .result',
        url: '.result_header > a',
        title: '.result_header > a',
        actionTarget: '.result_header',
        actionStyle: {
          fontSize: '85%',
          marginLeft: '.9em',
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

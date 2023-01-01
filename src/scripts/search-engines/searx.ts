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
        color: 'var(--ub-link-color, var(--color-categories-item-selected-font))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
      '.result-images': {
        padding: '.5rem .5rem 4.5rem .5rem',
      },
    },
    controlHandlers: [
      // Global
      {
        target: '.search_filters',
        style: {
          marginTop: '8px',
          order: 1,
        },
      },
    ],
    entryHandlers: [
      // Web
      {
        target: '.result',
        url: 'a',
        title: 'h3',
        actionTarget: '.url_i2',
        actionStyle: {
          '&::before': {
            content: '" · "',
            padding: '0 2px 0 4px',
          },
          fontSize: '1rem',
        },
      },
      // Images
      {
        target: '.result-images',
        url: 'a',
        title: '.title',
        actionTarget: 'a',
        actionStyle: {
          fontSize: '.7em',
          display: 'block',
          position: 'absolute',
          padding: '3.1rem 0 0 0',
        },
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  });
}

export const searx: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.searx,
  getSerpHandler,
};

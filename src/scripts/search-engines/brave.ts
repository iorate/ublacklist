import { SEARCH_ENGINES } from '../../common/search-engines';
import { SearchEngine, SerpHandler } from '../types';
import { handleSerp } from './helpers';

function getSerpHandler(): SerpHandler {
  return handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
      },
      '.ub-button': {
        color: 'var(--ub-link-color, var(--search-interactive-01))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
    },
    controlHandlers: [
      {
        target: '#filters-bar',
        style: {
          fontSize: '.66rem',
          whiteSpace: 'nowrap',
          padding: '4px',
        },
      },
    ],
    entryHandlers: [
      {
        target: '#results.section > .fdb',
        url: '.result-header',
        title: '.snippet-title',
        actionTarget: '.result-header',
      },
    ],
  });
}

export const brave: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.brave,
  getSerpHandler,
};

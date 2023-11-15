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
        color: 'var(--ub-link-color, var(--search-interactive-01))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
      'div[id^=img-]': {
        marginBottom: '80px !important',
      },
      'div[id^=img-][data-ub-blocked="visible"]': {
        marginRight: '80px !important',
      },
      '[data-ub-blocked="visible"] > .img-url': {
        backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
      },
      '.center-horizontally': {
        flexWrap: 'wrap',
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
      // Web
      {
        target: 'div[data-type="web"]',
        url: 'a',
        title: '.heading-serpresult',
        actionTarget: '.t-secondary',
        actionStyle: {
          fontSize: 'var(--text-sm-2)',
        },
      },
      // Images
      {
        target: '#img-holder > div > div[id^=img-]',
        url: '.img-url',
        title: '.img-title',
        actionTarget: '.image-container',
        actionStyle: {
          position: 'relative',
          top: '30px',
          fontSize: 'var(--text-sm-2)',
        },
      },
      // Videos
      {
        target: 'div[data-type="videos"]',
        url: 'a',
        title: '.snippet-title',
        actionTarget: '.video-content',
        actionStyle: {
          fontSize: 'var(--text-sm-2)',
        },
      },
      // News
      {
        target: '.svelte-1ckzfks',
        url: 'a',
        title: '.snippet-title',
        actionTarget: '.result-content > div',
        actionStyle: {
          fontSize: 'var(--text-sm-2)',
        },
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  });
}

export const brave: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.brave,
  getSerpHandler,
};

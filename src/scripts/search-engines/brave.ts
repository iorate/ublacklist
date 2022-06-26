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
        target: '#results.section > .snippet',
        url: '.result-header',
        title: '.snippet-title',
        actionTarget: '.result-header',
        actionStyle: {
          fontSize: 'var(--text-sm)',
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
        target: '#results.section > .card',
        url: 'a',
        title: '.card-body > .title',
        actionTarget: '.card-body > div',
        actionStyle: {
          fontSize: 'var(--text-sm)',
        },
      },
      // News
      {
        target: '#results.section > [data-macro="news"]',
        url: '.result-header',
        title: '.snippet-title',
        actionTarget: '.news-header',
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  });
}

export const brave: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.brave,
  getSerpHandler,
};

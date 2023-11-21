import { SEARCH_ENGINES } from '../../common/search-engines';
import { SearchEngine, SerpHandler } from '../types';
import { getDialogThemeFromBody, handleSerp } from './helpers';

function getSerpHandler(): SerpHandler {
  return handleSerp({
    // https://github.com/iorate/ublacklist/pull/374
    delay: 100,

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
        target: '#filters-container',
        style: {
          fontSize: 'var(--text-sm)',
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
        target: '.column > .image-wrapper',
        url: root => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          let m = root.querySelector('.text-ellipsis')!.innerHTML;
          if (!m.startsWith('http://') && !m.startsWith('https://')) {
            m = 'https://' + m;
          }
          return m;
        },
        title: '.img-title',
        actionTarget: 'button',
        actionStyle: {
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

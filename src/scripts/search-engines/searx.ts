import { SEARCH_ENGINES } from '../../common/search-engines';
import { CSSAttribute } from '../styles';
import { SearchEngine, SerpHandler } from '../types';
import { getDialogThemeFromBody, handleSerp } from './helpers';

const desktopRegularActionStyle: CSSAttribute = {
  '&::before': {
    content: '" · "',
    padding: '0 2px 0 4px',
  },
  // next to triangle
  '.eFM0qc > span:not([class]) + &::before': {
    content: 'none',
    padding: 0,
  },
  fontSize: '14px',
  lineHeight: 1.3,
  visibility: 'visible',
};

function getSerpHandler(): SerpHandler {
  return handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
      },
      '.ub-button': {
        color: 'var(--ub-link-color, rgb(101, 115, 255))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
    },
    controlHandlers: [
      // Text
      {
        target: '.search_filters',
        style: {
          marginTop: '8px',
        },
      },
    ],
    entryHandlers: [
      // Web
      {
        target: '.result',
        url: 'a',
        title: 'a',
        actionTarget: '.url_i2',
        actionStyle: desktopRegularActionStyle,
        /*  actionStyle: {
          display: 'block',
          fontSize: '13px',
          order: 1,
        },*/
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  });
}

export const searx: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.searx,
  getSerpHandler,
};

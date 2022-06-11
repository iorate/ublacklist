import { SEARCH_ENGINES } from '../../common/search-engines';
import { CSSAttribute } from '../styles';
import { SearchEngine, SerpHandler } from '../types';
import { handleSerp } from './helpers';

const globalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
  },
  '.ub-button': {
    color: 'var(--ub-link-color, rgba(84, 96, 122, .68))',
    fontSize: '14px',
    lineHeight: '17px',
  },
  '.ub-button:hover': {
    color: 'var(--ub-link-color, rgba(62, 70, 94, .8))',
  },
};

const serpHandlers: Readonly<Record<string, SerpHandler | undefined>> = {
  '/search/': handleSerp({
    globalStyle,
    controlHandlers: [
      {
        target: '.content__left',
        position: 'beforebegin',
        style: {
          display: 'block',
          marginBottom: '20px',
        },
      },
    ],
    entryHandlers: [
      {
        target: 'li.serp-item',
        url: '.organic__url',
        title: '.organic__title',
        actionTarget: '.organic__subtitle',
        actionStyle: {
          marginLeft: '2px',
        },
      },
    ],
  }),
  '/news/search': handleSerp({
    globalStyle,
    controlHandlers: [
      {
        target: '.news-app__content',
        position: 'afterbegin',
        style: {
          display: 'block',
          marginLeft: '15px',
          marginBottom: '5px',
        },
      },
    ],
    entryHandlers: [
      {
        target: 'article.news-search-story',
        url: '.mg-snippet__url',
        title: '.mg-snippet__title',
        actionTarget: '.mg-snippet__agency-info',
      },
    ],
  }),
};

export const yandex: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.yandex,
  getSerpHandler() {
    const path = new URL(window.location.href).pathname;
    return serpHandlers[path] || null;
  },
};

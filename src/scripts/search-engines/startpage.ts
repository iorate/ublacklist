import { CSSAttribute } from '../styles';
import { SerpHandler } from '../types';
import { getDialogThemeFromBody, handleSerp } from './helpers';

const defaultControlStyle: CSSAttribute = {
  color: 'rgb(127, 134, 159)',
  display: 'block',
  fontSize: '14px',
  marginTop: '8px',
};

export function getSerpHandler(): SerpHandler {
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
      // Web
      {
        target: '.layout-web__inline-nav-container',
        style: defaultControlStyle,
      },
      // News
      {
        target: '.layout-news__inline-nav-container',
        style: {
          ...defaultControlStyle,
          '@media (max-width: 989px)': {
            padding: '0 2rem 0 1rem',
          },
        },
      },
      // Videos
      {
        target: '.layout-video__inline-nav-container',
        style: {
          ...defaultControlStyle,
          '@media (max-width: 989px)': {
            padding: '0 2rem 0 1rem',
          },
        },
      },
    ],
    entryHandlers: [
      // Web
      {
        target: '.w-gl__result',
        url: '.w-gl__result-title',
        title: 'h3',
        actionTarget: '.w-gl__result__main',
        actionStyle: {
          display: 'block',
          marginTop: '4px',
        },
      },
      // News
      {
        target: '.article',
        url: '.article-right > a',
        title: '.title',
        actionTarget: '.article-right',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          marginTop: '4px',
        },
      },
      // Videos
      {
        target: '.vo-yt__link',
        url: '',
        title: '.vo-yt__title',
        actionTarget: '.vo-yt__details',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          marginTop: 0,
        },
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  });
}

import * as S from 'microstruct';
import { CSSAttribute } from '../styles';
import { SerpHandler } from '../types';
import { handleSerp } from './helpers';

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
    targets:
      '.layout-web__inline-nav-container, .layout-images-nav-container, .layout-news__inline-nav-container, .layout-video__inline-nav-container, .w-gl__result, .image-container, .article, .vo-sp__link',
    controlHandlers: [
      // Web
      {
        target: '.layout-web__inline-nav-container',
        style: defaultControlStyle,
      },
      // Images
      {
        target: '.layout-images__inline-nav-container',
        style: defaultControlStyle,
      },
      // News
      {
        target: '.layout-news__inline-nav-container',
        style: defaultControlStyle,
      },
      // Videos
      {
        target: '.layout-video__inline-nav-container',
        style: defaultControlStyle,
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
      // Images
      {
        target: '.image-container',
        url: root => {
          return root.dataset.imgMetadata != null
            ? S.parse(root.dataset.imgMetadata, S.object({ displayUrl: S.string() }))?.displayUrl ??
                null
            : null;
        },
        title: root => {
          return root.dataset.imgMetadata != null
            ? S.parse(root.dataset.imgMetadata, S.object({ title: S.string() }))?.title.replace(
                /<\/?b>/g,
                '',
              ) ?? null
            : null;
        },
        actionTarget: root => {
          const details = root.querySelector<HTMLElement>('.details');
          if (details) {
            details.style.bottom = '34px';
          }
          return root;
        },
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          height: '18px',
          margin: '8px 0',
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
        target: '.vo-sp__link',
        url: '',
        title: 'h1',
        actionTarget: '.vo-sp__details',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          marginTop: 0,
        },
      },
    ],
  });
}

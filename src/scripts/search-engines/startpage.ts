import * as Poi from 'poi-ts';
import { SearchEngine } from '../types';
import { createAction, createControl, getAddedElements, getEntry, getURL } from './helpers';
import startpageStyle from '../../styles/search-engines/startpage.scss';

export const startpage: SearchEngine = {
  matches: [
    'https://startpage.com/do/*',
    'https://startpage.com/sp/*',
    'https://www.startpage.com/do/*',
    'https://www.startpage.com/rvd/*',
    'https://www.startpage.com/sp/*',
  ],
  messageNames: {
    name: 'searchEngines_startpageName',
  },
  style: startpageStyle,

  getHandlers: () => ({
    controlHandlers: [
      // Web
      {
        createControl: createControl('ub-web-control', '.layout-web__inline-nav-container'),
      },
      // Images
      {
        createControl: createControl('ub-images-control', '.layout-images__inline-nav-container'),
      },
      // News
      {
        createControl: createControl('ub-news-control', '.layout-news__inline-nav-container'),
      },
      // Videos
      {
        createControl: createControl('ub-videos-control', '.layout-video__inline-nav-container'),
      },
    ],
    entryHandlers: [
      // Web
      {
        getEntry: getEntry('.w-gl__result'),
        getURL: getURL('.w-gl__result-title'),
        createAction: createAction('ub-web-action', ''),
      },
      // Images
      {
        getEntry: getEntry('.image-container'),
        getURL: (entry: HTMLElement): string | null => {
          if (!entry.dataset.imgMetadata) {
            return null;
          }
          try {
            const metadata: unknown = JSON.parse(entry.dataset.imgMetadata);
            Poi.validate(metadata, Poi.object({ displayUrl: Poi.string() }));
            return metadata.displayUrl;
          } catch {
            return null;
          }
        },
        createAction: createAction('ub-images-action', ''),
        adjustEntry: (entry: HTMLElement): void => {
          const details = entry.querySelector<HTMLElement>('.details');
          if (!details) {
            return;
          }
          details.style.bottom = '34px';
        },
      },
      // News
      {
        getEntry: getEntry('.article'),
        getURL: getURL('.article-right > a'),
        createAction: createAction('ub-news-action', '.article-right'),
      },
      // Videos
      {
        getEntry: getEntry('.vo-sp__link'),
        getURL: getURL(''),
        createAction: createAction('ub-videos-action', '.vo-sp__details'),
      },
    ],
    getAddedElements: getAddedElements('.w-gl__result, .image-container, .article, .vo-sp__link'),
  }),
};

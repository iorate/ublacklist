import {
  createActionUnder,
  createControlUnder,
  getAddedElements,
  getEntry,
  getStaticContainers,
  getURL,
} from '../content-handlers';

window.ubContentHandlers = {
  controlHandlers: [
    // Web
    {
      createControl: createControlUnder('ub-web-control', '.layout-web__inline-nav-container'),
    },
    // Images
    {
      createControl: createControlUnder(
        'ub-images-control',
        '.layout-images__inline-nav-container',
      ),
    },
    // News
    {
      createControl: createControlUnder('ub-news-control', '.layout-news__inline-nav-container'),
    },
    // Videos
    {
      createControl: createControlUnder('ub-videos-control', '.layout-video__inline-nav-container'),
    },
  ],
  entryHandlers: [
    // Web
    {
      getEntry: getEntry('.w-gl__result'),
      getURL: getURL('.w-gl__result-title'),
      createAction: createActionUnder('ub-web-action', ''),
    },
    // Images
    {
      getEntry: getEntry('.image-container'),
      getURL: entry => {
        if (!entry.dataset.imgMetadata) {
          return null;
        }
        try {
          const metadata = JSON.parse(entry.dataset.imgMetadata);
          return metadata.displayUrl ?? null;
        } catch {
          return null;
        }
      },
      createAction: createActionUnder('ub-images-action', ''),
      adjustEntry: entry => {
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
      createAction: createActionUnder('ub-news-action', '.article-right'),
    },
    // Videos
    {
      getEntry: getEntry('.vo-sp__link'),
      getURL: getURL(''),
      createAction: createActionUnder('ub-videos-action', '.vo-sp__details'),
    },
  ],
  staticContainerHandlers: [
    // Web
    {
      getStaticContainers: getStaticContainers('.w-gl'),
      getAddedElements: getAddedElements('.w-gl__result'),
    },
    // Images
    {
      getStaticContainers: getStaticContainers('.ig-gl'),
      getAddedElements: getAddedElements('.image-container'),
    },
    // News
    {
      getStaticContainers: getStaticContainers('.cn-bg'),
      getAddedElements: getAddedElements('.article'),
    },
    // Videos
    {
      getStaticContainers: getStaticContainers('.vo-sp'),
      getAddedElements: getAddedElements('.vo-sp__link'),
    },
  ],
};

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
    {
      createControl: createControlUnder('ub-web-control', '.layout-web__inline-nav-container'),
    },
    {
      createControl: createControlUnder(
        'ub-images-control',
        '.layout-images__inline-nav-container',
      ),
    },
  ],
  entryHandlers: [
    {
      getEntry: getEntry('.w-gl__result'),
      getURL: getURL('.w-gl__result-title'),
      createAction: createActionUnder('ub-web-action', ''),
    },
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
  ],
  staticContainerHandlers: [
    {
      getStaticContainers: getStaticContainers('.w-gl'),
      getAddedElements: getAddedElements('.w-gl__result'),
    },
    {
      getStaticContainers: getStaticContainers('.ig-gl'),
      getAddedElements: getAddedElements('.image-container'),
    },
  ],
};

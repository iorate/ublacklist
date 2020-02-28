import {
  createActionDefault,
  createControlDefault,
  getEntryDefault,
  getURLDefault,
} from '../content-handlers';

window.ubContentHandlers = {
  controlHandlers: [
    {
      createControl: createControlDefault('ub-web-control', '.layout-web__inline-nav-container'),
    },
    {
      createControl: createControlDefault(
        'ub-images-control',
        '.layout-images__inline-nav-container',
      ),
    },
  ],
  entryHandlers: [
    {
      getEntry: getEntryDefault('.w-gl__result'),
      getURL: getURLDefault('.w-gl__result-title'),
      createAction: createActionDefault('ub-web-action'),
    },
    {
      getEntry: getEntryDefault('.ig-gl__list > .image-container'),
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
      createAction: createActionDefault('ub-images-action'),
      adjustEntry: entry => {
        const details = entry.querySelector<HTMLElement>('.details');
        if (!details) {
          return;
        }
        details.style.bottom = '34px';
      },
    },
  ],
};

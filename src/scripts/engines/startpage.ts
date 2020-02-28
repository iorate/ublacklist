import {
  createActionDefault,
  createControlDefault,
  getEntryDefault,
  getURLDefault,
} from '../content-handlers';

window.ubContentHandlers = {
  controlHandlers: [
    {
      createControl: createControlDefault('ub-control-web', '.search-filters-toolbar__container'),
    },
    {
      createControl: createControlDefault(
        'ub-control-images',
        '.images-filters-toolbar__container',
      ),
    },
  ],
  entryHandlers: [
    {
      getEntry: getEntryDefault('.w-gl__result'),
      getURL: getURLDefault(':scope > .w-gl__result-title'),
      createAction: createActionDefault('ub-action-web'),
    },
    {
      getEntry: getEntryDefault('.ig-gl__list .image-container'),
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
      createAction: createActionDefault('ub-action-images'),
    },
  ],
};

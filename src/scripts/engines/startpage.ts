import {
  createActionDefault,
  createControlDefault,
  getEntriesDefault,
  getURLDefault,
} from '../content-handlers';

window.ubContentHandlers = {
  controlHandlers: [
    {
      createControl: createControlDefault('.search-filters-toolbar__container', 'ub-control-web'),
    },
    {
      createControl: createControlDefault(
        '.images-filters-toolbar__container',
        'ub-control-images',
      ),
    },
  ],
  entryHandlers: [
    {
      getEntries: getEntriesDefault('.w-gl__result'),
      getURL: getURLDefault(':scope > .w-gl__result-title'),
      createAction: createActionDefault('', 'ub-action-web'),
    },
    {
      getEntries: getEntriesDefault('.ig-gl__list .image-container'),
      getURL: (entry: HTMLElement): string | null => {
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
      createAction: createActionDefault('', 'ub-action-images'),
    },
  ],
};

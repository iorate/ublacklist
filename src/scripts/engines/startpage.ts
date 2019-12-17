import {
  createActionDefault,
  createControlDefault,
  getBaseDefault,
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
      getBase: getBaseDefault('.w-gl__result'),
      getURL: getURLDefault('> .w-gl__result-title'),
      createAction: createActionDefault('', 'ub-action-web'),
    },
    {
      getBase: getBaseDefault('.ig-gl__list .image-container'),
      getURL: (base: HTMLElement): string | null => {
        if (!base.dataset.imgMetadata) {
          return null;
        }
        try {
          const metadata = JSON.parse(base.dataset.imgMetadata);
          return metadata.displayUrl ?? null;
        } catch {
          return null;
        }
      },
      createAction: createActionDefault('', 'ub-action-images'),
    },
  ],
};

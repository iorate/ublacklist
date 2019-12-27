import {
  createActionDefault,
  createControlDefault,
  getEntryCandidatesDefault,
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
      getEntryCandidates: getEntryCandidatesDefault('.w-gl__result'),
      getURL: getURLDefault('> .w-gl__result-title'),
      createAction: createActionDefault('', 'ub-action-web'),
    },
    {
      getEntryCandidates: getEntryCandidatesDefault('.ig-gl__list .image-container'),
      getURL: (entryCandidate: HTMLElement): string | null => {
        if (!entryCandidate.dataset.imgMetadata) {
          return null;
        }
        try {
          const metadata = JSON.parse(entryCandidate.dataset.imgMetadata);
          return metadata.displayUrl ?? null;
        } catch {
          return null;
        }
      },
      createAction: createActionDefault('', 'ub-action-images'),
    },
  ],
};

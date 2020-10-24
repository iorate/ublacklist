import { SearchEngine } from '../types';
import { createAction, getAddedElements, getEntry, getURL } from './helpers';
import ecosiaStyle from '!!raw-loader!extract-loader!css-loader!sass-loader!../../styles/search-engines/ecosia.scss';

const pageSelectors = {
  results: '.mainline-results .result',
  entry: '.mainline-results .result',
  url: '.mainline-results .result a',
  message: '.mainline-top',
};

const ubSelectors = {
  action: 'ub-web-general-action',
  control: 'ub-web-control msg',
  button: '.ub-link-button',
};

function adjustButtons(element: HTMLElement): void {
  for (const button of element.querySelectorAll<HTMLElement>(ubSelectors.button)) {
    button.classList.add('msg__all');
  }
}

export const ecosia: SearchEngine = {
  matches: [
    '*://www.ecosia.org/',
    '*://www.ecosia.org//',
    '*://www.ecosia.org/search?*'
  ],
  messageNames: {
    name: 'searchEngines_ecosiaName',
  },
  style: ecosiaStyle,

  getHandlers: () => ({
    controlHandlers: [
      {
        createControl: (): HTMLElement | null => {
          const message = document.querySelector(pageSelectors.message);
          if (!message) {
            return null;
          }
          const control = document.createElement('div');
          control.className = ubSelectors.control;
          message.insertBefore(control, message.firstChild);
          return control;
        },
        adjustControl: adjustButtons,
      },
    ],
    entryHandlers: [
      {
        getEntry: getEntry(pageSelectors.entry),
        getURL: getURL(pageSelectors.url),
        createAction: createAction(ubSelectors.action),
        adjustEntry: adjustButtons,
      },
    ],
    getAddedElements: getAddedElements(pageSelectors.results),
  }),
};

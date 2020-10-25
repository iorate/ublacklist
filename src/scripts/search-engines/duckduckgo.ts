import { SearchEngine } from '../types';
import { createAction, getAddedElements, getEntry, getURL } from './helpers';
import duckduckgoStyle from '../../styles/search-engines/duckduckgo.scss';

function adjustButtons(element: HTMLElement): void {
  for (const button of element.querySelectorAll<HTMLElement>('.ub-link-button')) {
    button.classList.add('msg__all');
  }
}

export const duckduckgo: SearchEngine = {
  matches: [
    '*://duckduckgo.com/',
    '*://duckduckgo.com//',
    '*://duckduckgo.com/?*',
    '*://safe.duckduckgo.com/',
    '*://safe.duckduckgo.com//',
    '*://safe.duckduckgo.com/?*',
    '*://start.duckduckgo.com/',
    '*://start.duckduckgo.com//',
    '*://start.duckduckgo.com/?*',
  ],
  messageNames: {
    name: 'searchEngines_duckduckgoName',
  },
  style: duckduckgoStyle,

  getHandlers: () => ({
    controlHandlers: [
      {
        createControl: (): HTMLElement | null => {
          const message = document.getElementById('message');
          if (!message) {
            return null;
          }
          const control = document.createElement('div');
          control.className = 'ub-web-control msg';
          message.insertBefore(control, message.firstChild);
          return control;
        },
        adjustControl: adjustButtons,
      },
    ],
    entryHandlers: [
      {
        getEntry: getEntry('.result:not(.result--ad):not(.result--news)'),
        getURL: getURL('.result__a'),
        createAction: createAction('ub-web-general-action', '.result__body'),
        adjustEntry: adjustButtons,
      },
    ],
    getAddedElements: getAddedElements('.result'),
  }),
};

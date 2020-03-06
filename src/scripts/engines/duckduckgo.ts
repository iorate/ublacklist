import { createActionUnder, getEntry, getStaticElements, getURL } from '../content-handlers';

window.ubContentHandlers = {
  controlHandlers: [
    {
      createControl: () => {
        const message = document.getElementById('message');
        if (!message) {
          return null;
        }
        const control = document.createElement('div');
        control.className = 'ub-web-control msg';
        message.insertBefore(control, message.firstChild);
        return control;
      },
      adjustControl: control => {
        for (const button of control.querySelectorAll<HTMLElement>('.ub-button')) {
          button.classList.add('msg__all');
        }
      },
    },
  ],
  entryHandlers: [
    {
      getEntry: getEntry('.result:not(.result--ad):not(.result--news)'),
      getURL: getURL('.result__a'),
      createAction: createActionUnder('ub-web-general-action', '.result__body'),
      adjustEntry: entry => {
        for (const button of entry.querySelectorAll<HTMLElement>('.ub-button')) {
          button.classList.add('msg__all');
        }
      },
    },
  ],
  staticElementHandler: {
    getStaticElements: getStaticElements('.result'),
  },
};

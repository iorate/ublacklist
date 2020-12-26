import { SerpHandler } from '../types';
import { handleSerpElement, handleSerpHead, handleSerpStart } from './helpers';

const onSerpElement = handleSerpElement({
  controlHandlers: [
    {
      target: '.mainline-top',
      position: 'afterbegin',
      style: {
        display: 'block',
        fontSize: '13px',
        paddingRight: '1em',
        textAlign: 'right',
      },
    },
  ],
  entryHandlers: [
    {
      target: '.mainline-results .result',
      url: 'a',
      actionTarget: '',
      actionStyle: {
        display: 'block',
        fontSize: '13px',
      },
    },
  ],
});

export function getSerpHandler(): SerpHandler {
  return {
    onSerpStart: handleSerpStart({
      elements: '.mainline-results .result',
      onSerpElement,
    }),
    onSerpHead: handleSerpHead({
      globalStyle: {
        '[data-ub-blocked="visible"]': {
          background: 'rgba(255, 192, 192, 0.5) !important',
        },
        '.ub-button': {
          color: 'rgb(0, 100, 77)',
        },
        '.ub-button:hover': {
          textDecoration: 'underline',
        },
      },
    }),
    onSerpElement,
  };
}

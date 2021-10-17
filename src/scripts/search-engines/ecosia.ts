import { SerpHandler } from '../types';
import { handleSerp } from './helpers';

export function getSerpHandler(): SerpHandler {
  return handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
      },
      '.ub-button': {
        color: 'var(--ub-link-color, rgb(0, 100, 77))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
    },
    controlHandlers: [
      {
        target: 'body',
        position: 'afterbegin',
        style: {
          display: 'block',
          fontSize: '13px',
          padding: '9px 20px',
          textAlign: 'right',
        },
      },
    ],
    entryHandlers: [
      {
        target: '.result',
        url: 'a',
        title: 'a',
        actionTarget: '.result__body',
        actionStyle: {
          display: 'block',
          fontSize: '13px',
          paddingTop: '5px',
        },
      },
    ],
  });
}

import { CSSAttribute, css } from '../styles';
import { SerpHandler } from '../types';
import { handleSerpElement, handleSerpHead, handleSerpStart, insertElement } from './helpers';

function defaultControlStyle(style?: CSSAttribute): (root: HTMLElement) => void {
  return root => {
    const class_ = css({
      '&.msg': {
        margin: 0,
        maxWidth: 'none',
        padding: '0.5em 10px',
        ...(style ?? {}),
      },
    });
    root.classList.add(class_, 'msg');
  };
}

const onSerpElement = handleSerpElement({
  controlHandlers: [
    // All
    {
      scope: 'all',
      target: '#message',
      position: 'afterbegin',
      style: defaultControlStyle(),
      buttonStyle: 'msg__all',
    },
    // Images
    {
      scope: 'images',
      target: '#zci-images',
      position: target => {
        const tileWrap = target.querySelector<HTMLElement>('.tile-wrap');
        return tileWrap && insertElement('span', tileWrap, 'beforebegin');
      },
      style: defaultControlStyle({
        margin: '0 10px 0.5em',
      }),
      buttonStyle: 'msg__all',
    },
    // Videos
    {
      scope: 'videos',
      target: '#zci-videos',
      position: target => {
        const tileWrap = target.querySelector<HTMLElement>('.tile-wrap');
        return tileWrap && insertElement('span', tileWrap, 'beforebegin');
      },
      style: defaultControlStyle({
        margin: '0 10px 0.5em',
      }),
      buttonStyle: 'msg__all',
    },
    // News
    {
      scope: 'news',
      target: '.vertical--news',
      position: target => {
        const message = target.querySelector<HTMLElement>('.results--message');
        return message && insertElement('span', message, 'afterbegin');
      },
      style: defaultControlStyle(),
      buttonStyle: 'msg__all',
    },
  ],
  entryHandlers: [
    // All
    {
      scope: 'all',
      target: '.result:not(.result--ad):not(.result--news)',
      url: '.result__a',
      actionTarget: '.result__body',
      actionStyle: {
        display: 'block',
        marginTop: '2px',
      },
      actionButtonStyle: 'msg__all',
    },
    // Images
    {
      scope: 'images',
      target: '.tile--img',
      url: '.tile--img__sub',
      actionTarget: '.tile--img__sub',
      actionStyle: {
        lineHeight: '1.5',
      },
      actionButtonStyle: 'msg__all',
    },
    // Videos
    {
      scope: 'videos',
      target: '.tile--vid',
      url: '.tile__title > a',
      actionTarget: '.tile__body',
      actionStyle: {
        display: 'block',
        margin: '0.4em 0 -0.4em',
      },
      actionButtonStyle: 'msg__all',
    },
    // News
    {
      scope: 'news',
      target: '.result--news',
      url: '.result__a',
      actionTarget: '.result__body',
      actionStyle: {
        display: 'block',
        marginTop: '2px',
      },
      actionButtonStyle: 'msg__all',
    },
  ],
});

export function getSerpHandler(): SerpHandler {
  return {
    onSerpStart: handleSerpStart({
      elements:
        '#message, #zci-images, #zci-videos, .vertical--news, .result, .tile--img, .tile--vid',
      onSerpElement,
    }),
    onSerpHead: handleSerpHead({
      globalStyle: {
        '[data-ub-blocked="visible"], [data-ub-blocked="visible"] + .results__sitelink--organics, [data-ub-blocked="visible"] .tile--img__sub': {
          background: 'rgba(255, 192, 192, 0.5) !important',
        },
        '[data-ub-blocked="visible"] .tile__body': {
          background: 'transparent !important',
        },
        '[data-ub-blocked="hidden"] + .results__sitelink--organics': {
          display: 'none !important',
        },
        '.ub-button.msg__all': {
          display: 'inline',
        },
        '.ub-button:hover': {
          textDecoration: 'underline',
        },
      },
    }),
    onSerpElement,
  };
}

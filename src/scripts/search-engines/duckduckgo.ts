import { SEARCH_ENGINES } from '../../common/search-engines';
import { CSSAttribute, css, glob } from '../styles';
import { SearchEngine } from '../types';
import { getDialogThemeFromBody, handleSerp, insertElement } from './helpers';

function defaultControlStyle(style?: CSSAttribute): (root: HTMLElement) => void {
  return root => {
    const class_ = css({
      '&.msg': {
        margin: 0,
        maxWidth: 'none',
        padding: '0.5em 10px',
        ...(style || {}),
      },
    });
    root.classList.add(class_, 'msg');
  };
}

const serpHandler = handleSerp({
  globalStyle: colors => {
    glob({
      [[
        '[data-ub-blocked="visible"]',
        // Override !important selectors in All and News
        '.result.result.result.result.result[data-ub-blocked="visible"]',
        '[data-ub-blocked="visible"] + .result__sitelinks--organics',
        '[data-ub-blocked="visible"] .tile--img__sub',
      ].join(', ')]: {
        backgroundColor: `${colors.blockColor ?? 'rgba(255, 192, 192, 0.5)'} !important`,
      },
      ...Object.fromEntries(
        colors.highlightColors.map((highlightColor, i) => [
          [
            `[data-ub-highlight="${i + 1}"]`,
            // Override !important selectors in All and News
            `.result.result.result.result.result[data-ub-highlight="${i + 1}"]`,
            `[data-ub-highlight="${i + 1}"] + .result__sitelinks--organics`,
            `[data-ub-highlight="${i + 1}"] .tile--img__sub`,
          ].join(', '),
          {
            backgroundColor: `${highlightColor} !important`,
          },
        ]),
      ),
      '[data-ub-blocked] .tile__media, [data-ub-highlight] .tile__media, [data-ub-blocked] .tile__body, [data-ub-highlight] .tile__body':
        {
          backgroundColor: 'transparent !important',
        },
      '[data-ub-blocked="hidden"] + .result__sitelinks--organics': {
        display: 'none !important',
      },
      '.ub-button.result__a': {
        ...(colors.linkColor != null ? { color: `${colors.linkColor} !important` } : {}),
        display: 'inline',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
      // https://github.com/iorate/uBlacklist/issues/78
      '.is-mobile .result--news.result--img .result__extras': {
        bottom: 'calc(2.1em + 2px) !important',
      },
    });
  },
  controlHandlers: [
    // All
    {
      scope: 'all',
      target: 'ol.react-results--main',
      position: 'beforebegin',
      style: defaultControlStyle(),
      buttonStyle: 'result__a',
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
      buttonStyle: 'result__a',
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
      buttonStyle: 'result__a',
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
      buttonStyle: 'result__a',
    },
  ],
  entryHandlers: [
    // All
    {
      scope: 'all',
      target: 'ol.react-results--main > li',
      url: 'a[data-testid="result-extras-url-link"]',
      title: 'a[data-testid="result-title-a"]',
      actionTarget: 'article[data-testid="result"]',
      actionStyle: {
        display: 'block',
        marginTop: '2px',
        order: 3,
      },
      actionButtonStyle: 'result__a',
    },
    // Images
    {
      scope: 'images',
      target: '.tile--img',
      url: '.tile--img__sub',
      title: '.tile--img__title',
      actionTarget: '.tile--img__sub',
      actionStyle: {
        lineHeight: '1.5',
      },
      actionButtonStyle: 'result__a',
    },
    // Videos
    {
      scope: 'videos',
      target: '.tile--vid',
      url: '.tile__title > a',
      title: '.tile__title > a',
      actionTarget: '.tile__body',
      actionStyle: {
        display: 'block',
        margin: '0.4em 0 -0.4em',
      },
      actionButtonStyle: 'result__a',
    },
    // News
    {
      scope: 'news',
      target: '.result--news',
      url: '.result__a',
      title: '.result__a',
      actionTarget: '.result__body',
      actionStyle: {
        display: 'block',
        marginTop: '2px',
        // https://github.com/iorate/uBlacklist/issues/78
        '.is-mobile .result--news.result--img &': {
          bottom: 'calc(0.5em - 14px)',
          clear: 'both',
          position: 'relative',
        },
      },
      actionButtonStyle: 'result__a',
    },
  ],
  pagerHandlers: [
    {
      target: 'ol.react-results--main',
      innerTargets: 'li',
    },
  ],
  getDialogTheme: getDialogThemeFromBody(),
});

// #if CHROME
const htmlSerpHandler = handleSerp({
  globalStyle: {
    '[data-ub-blocked="visible"]': {
      backgroundColor: 'rgba(255, 192, 192, 0.5)',
    },
    '.ub-button': {
      color: 'rgb(0, 39, 142)',
    },
    '.ub-button:hover': {
      textDecoration: 'underline',
    },
  },
  controlHandlers: [
    {
      target: '#links',
      position: 'afterbegin',
      style: {
        display: 'block',
        marginBottom: '1em',
        padding: '0.5em 10px',
      },
    },
  ],
  entryHandlers: [
    {
      target: '.result',
      url: '.result__a',
      title: '.result__a',
      actionTarget: '.result__body',
      actionStyle: {
        display: 'block',
        marginTop: '2px',
      },
    },
  ],
});
// #endif

export const duckduckgo: Readonly<SearchEngine> = {
  ...SEARCH_ENGINES.duckduckgo,
  getSerpHandler() {
    // #if CHROME
    return new URL(window.location.href).hostname === 'html.duckduckgo.com'
      ? htmlSerpHandler
      : serpHandler;
    /* #else
    return serpHandler;
    */
    // #endif
  },
};

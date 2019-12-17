import { UAParser } from 'ua-parser-js';
import {
  createActionDefault,
  createControlDefault,
  getAddedElementsDefault,
  getBaseDefault,
  getURLDefault,
} from '../content-handlers';

function getURLFromQuery(selector: string): (base: HTMLElement) => string | null {
  return (base: HTMLElement): string | null => {
    const a = selector ? base.querySelector(`:scope ${selector}`) : base;
    const url = a?.getAttribute('href');
    if (!url) {
      return null;
    }
    try {
      const u = new URL(url, window.location.href);
      if (u.pathname !== '/url') {
        return null;
      }
      return u.searchParams.get('q');
    } catch {
      return null;
    }
  };
}

const device = new UAParser(window.navigator.userAgent).getDevice().type ?? '';
const tbm = new URL(window.location.href).searchParams.get('tbm') ?? '';
switch (`${device}/${tbm}`) {
  // /All
  case '/':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#resultStats', 'ub-control-all'),
        },
      ],
      entryHandlers: [
        {
          getBase: getBaseDefault('div#rso > div > div.srg > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-all'),
        },
        // Featured Snippet
        {
          getBase: getBaseDefault(
            'div#rso > div > div.g.mnr-c.g-blk > div.kp-blk > div.xpdopen > div > div > div.g',
            5,
          ),
          getURL: getURLDefault(
            '> div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r > a',
          ),
          createAction: createActionDefault(
            '> div.kp-blk > div.xpdopen > div > div > div.g > div > div.rc > div.r',
            'ub-action-all',
          ),
        },
        // Latest
        {
          getBase: getBaseDefault(
            'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
            1,
          ),
          getURL: getURLDefault('> g-inner-card > a'),
          createAction: createActionDefault('> g-inner-card', 'ub-action-all-latest'),
        },
        // Top Stories (Horizontal)
        {
          getBase: getBaseDefault(
            'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(-n+3) > g-inner-card > div:nth-child(2)',
            2,
          ),
          getURL: getURLDefault('> g-inner-card > a'),
          createAction: createActionDefault(
            '> g-inner-card',
            'ub-action-all-top-stories-horizontal',
          ),
        },
        {
          getBase: getBaseDefault(
            'div#rso > div > div > g-section-with-header > div > div > g-scrolling-carousel > div > div > div > div:nth-child(n+4) > g-inner-card',
            1,
          ),
          getURL: getURLDefault('> g-inner-card > a'),
          createAction: createActionDefault(
            '> g-inner-card',
            'ub-action-all-top-stories-horizontal',
          ),
        },
        // Top Stories (Vertical)
        {
          getBase: getBaseDefault(
            'div#rso > div > div > g-section-with-header > div > div > div > div > div > div > lazy-load-item > div.dbsr > a > div > div:last-child > div:nth-child(2)',
            8,
          ),
          getURL: getURLDefault('> div > div > lazy-load-item > div.dbsr > a'),
          createAction: createActionDefault(
            '> div > div > lazy-load-item > div.dbsr > a > div > div:last-child > div:nth-child(2)',
            'ub-action-all-top-stories-vertical',
          ),
        },
        {
          getBase: getBaseDefault(
            'div#rso > div > div > g-section-with-header > div > div > div > div > div > div.dbsr > a > div > div > div:nth-child(2)',
            6,
          ),
          getURL: getURLDefault('> div > div.dbsr > a'),
          createAction: createActionDefault(
            '> div > div.dbsr > a > div > div > div:nth-child(2)',
            'ub-action-all-top-stories-vertical',
          ),
        },
        {
          getBase: getBaseDefault(
            'div#rso > div > div > g-section-with-header > div > div > g-inner-card',
          ),
          getURL: getURLDefault('> div.dbsr.kno-fb-ctx > g-card-section > a'),
          createAction: createActionDefault(
            '> div.dbsr.kno-fb-ctx > g-card-section > div',
            'ub-action-all',
          ),
        },
        // Twitter
        {
          getBase: getBaseDefault('div#rso > div > div > div.g'),
          getURL: getURLDefault('> g-section-with-header > div > div > div > div > g-link > a'),
          createAction: createActionDefault(
            '> g-section-with-header > div > div > div > div:nth-child(3)',
            'ub-action-all-twitter',
          ),
        },
        {
          getBase: getBaseDefault('div#rso > div > div > div.g'),
          getURL: getURLDefault('> g-section-with-header > div > div > h3.r > g-link > a'),
          createAction: createActionDefault(
            '> g-section-with-header > div > div > div',
            'ub-action-all-twitter-search',
          ),
        },
        // Videos
        {
          getBase: getBaseDefault(
            'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
            1,
          ),
          getURL: getURLDefault('> g-inner-card > div > a'),
          createAction: createActionDefault('> g-inner-card', 'ub-action-all-videos'),
        },
        // Web Result
        {
          getBase: getBaseDefault('div#rso > div > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-all'),
        },
        // Web Result with Site Links
        {
          getBase: getBaseDefault('div#rso > div > div.g'),
          getURL: getURLDefault('> div > div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div > div.rc > div.r', 'ub-action-all'),
        },
      ],
      autoPagerizeHandlers: [
        {
          getAddedElements: getAddedElementsDefault('.g'),
        },
      ],
    };
    break;

  // /Books
  case '/bks':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#resultStats', 'ub-control-books'),
        },
      ],
      entryHandlers: [
        {
          getBase: getBaseDefault('.Yr5TG'),
          getURL: getURLDefault('> .bHexk > a'),
          createAction: createActionDefault('> .bHexk > a', 'ub-action-books'),
        },
        {
          getBase: getBaseDefault('div#rso > div > div.srg > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-books'),
        },
        // All
        {
          getBase: getBaseDefault('div#rso > div > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-books'),
        },
      ],
      autoPagerizeHandlers: [
        {
          getAddedElements: getAddedElementsDefault('.Yr5TG, .g'),
        },
      ],
    };
    break;

  // /Images
  case '/isch':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl(): HTMLElement | null {
            const parent = document.getElementById('ab_ctls') as HTMLElement | null;
            if (!parent) {
              return null;
            }
            const control = document.createElement('li');
            control.className = 'ab_ctl ub-control-images';
            parent.appendChild(control);
            return control;
          },
        },
        {
          createControl: createControlDefault('.cj2HCb', 'ub-control-images-1'),
        },
      ],
      entryHandlers: [
        {
          getBase: getBaseDefault('div#rg_s > div.rg_bx.rg_di.rg_el.ivg-i'),
          getURL(base: HTMLElement): string | null {
            const div = base.querySelector(':scope > div.rg_meta.notranslate');
            if (!div) {
              return null;
            }
            return /"ru":"([^"]+)"/.exec(div.textContent!)?.[1] ?? null;
          },
          createAction: createActionDefault('', 'ub-action-images'),
        },
        {
          getBase: getBaseDefault('div#islrg > div.islrc > div.isv-r'),
          getURL: getURLDefault('> a:nth-child(2)'),
          createAction: createActionDefault('', 'ub-action-images'),
        },
      ],
    };
    break;

  // /News
  case '/nws':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#resultStats', 'ub-control-news'),
        },
      ],
      entryHandlers: [
        {
          getBase: getBaseDefault('g-card'),
          getURL: getURLDefault('.dbsr > a'),
          createAction: createActionDefault('.pDavDe', 'ub-action-news'),
        },
        {
          getBase: getBaseDefault('.g > .ts > .gG0TJc'),
          getURL: getURLDefault('> h3.r > a.l'),
          createAction: createActionDefault('> .slp', 'ub-action-news-1'),
          modifyDOM(base: HTMLElement): void {
            const image = base.previousElementSibling;
            if (image && !image.querySelector('.f')) {
              base.insertBefore(image, base.firstChild);
            }
          },
        },
        {
          getBase: getBaseDefault('.g > .ts > .card-section'),
          getURL: getURLDefault('> a'),
          createAction: createActionDefault('', 'ub-action-news-1'),
          modifyDOM(base: HTMLElement): void {
            const viewAll = base.querySelector('.cWEW3c');
            if (viewAll) {
              const parent = base.parentElement!;
              const nextSibling = base.nextSibling;
              const div = document.createElement('div');
              div.style.display = 'inline-block';
              div.appendChild(base);
              div.appendChild(viewAll);
              parent.insertBefore(div, nextSibling);
            }
          },
        },
        {
          getBase: (addedElement: HTMLElement): HTMLElement | null => {
            const base = getBaseDefault('.g > .ts > a.top')(addedElement);
            if (!base || !base.querySelector('.f')) {
              return null;
            }
            return base;
          },
          getURL: getURLDefault(''),
          createAction: createActionDefault('', 'ub-action-news-image'),
        },
      ],
      autoPagerizeHandlers: [
        {
          getAddedElements: getAddedElementsDefault('g-card, .gG0TJc, .card-section, .top'),
        },
      ],
    };
    break;

  // /Videos
  case '/vid':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#resultStats', 'ub-control-videos'),
        },
      ],
      entryHandlers: [
        {
          getBase: getBaseDefault('div#rso > div > div.srg > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-videos'),
        },
      ],
      autoPagerizeHandlers: [
        {
          getAddedElements: getAddedElementsDefault('.g'),
        },
      ],
    };
    break;

  // Mobile/All, Mobile/News, Mobile/Videos, Tablet/All, Tablet/News, Tablet/Videos
  case 'mobile/':
  case 'mobile/nws':
  case 'mobile/vid':
  case 'tablet/':
  case 'tablet/nws':
  case 'tablet/vid':
    window.ubContentHandlers = {
      controlHandlers: [],
      entryHandlers: [
        {
          getBase: getBaseDefault('div#rso div.xpd'),
          getURL: getURLDefault('> div:first-child a'),
          createAction: createActionDefault('> div:last-child', 'ub-action-mobile-all'),
        },
        {
          getBase: getBaseDefault('div#main div.xpd'),
          getURL: getURLFromQuery('> div:first-child > a'),
          createAction: createActionDefault('', 'ub-action-mobile-all'),
        },
        {
          getBase: getBaseDefault('div#ires > ol > div.g'),
          getURL: getURLFromQuery('> h3.r > a'),
          createAction: createActionDefault('> div.s > div:first-child', 'ub-action-all'),
        },
      ],
    };
    break;

  default:
    window.ubContentHandlers = null;
    break;
}

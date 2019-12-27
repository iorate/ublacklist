import { UAParser } from 'ua-parser-js';
import {
  createActionDefault,
  createControlDefault,
  getAddedElementsDefault,
  getEntryCandidatesDefault,
  getURLDefault,
} from '../content-handlers';

function getURLFromQuery(selector: string): (entryCandidate: HTMLElement) => string | null {
  return (entryCandidate: HTMLElement): string | null => {
    const a = selector ? entryCandidate.querySelector(`:scope ${selector}`) : entryCandidate;
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

function createActionForRecipes(entryCandidate: HTMLElement): HTMLElement | null {
  const site = entryCandidate.querySelector('.g6wEbd');
  if (!site) {
    return null;
  }
  const action = document.createElement('div');
  action.className = 'ub-action-all-recipes';
  site.parentElement!.insertBefore(action, site.nextSibling);
  return action;
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
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div.srg > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-all'),
        },
        // Featured Snippet
        {
          getEntryCandidates: getEntryCandidatesDefault(
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
          getEntryCandidates: getEntryCandidatesDefault(
            'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
            1,
          ),
          getURL: getURLDefault('> g-inner-card > a'),
          createAction: createActionDefault('> g-inner-card', 'ub-action-all-latest'),
        },
        // Recipes
        {
          getEntryCandidates: getEntryCandidatesDefault('.YwonT'),
          getURL: getURLDefault('> g-inner-card > g-link > a'),
          createAction: createActionForRecipes,
        },
        {
          getEntryCandidates: (addedElement: HTMLElement): HTMLElement[] => {
            return addedElement.matches('.yl > div')
              ? Array.from<HTMLElement>(addedElement.querySelectorAll('.YwonT'))
              : [];
          },
          getURL: getURLDefault('> div > g-inner-card > g-link > a'),
          createAction: createActionForRecipes,
        },
        // Top Stories (Horizontal)
        {
          getEntryCandidates: getEntryCandidatesDefault(
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
          getEntryCandidates: getEntryCandidatesDefault(
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
          getEntryCandidates: getEntryCandidatesDefault(
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
          getEntryCandidates: getEntryCandidatesDefault(
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
          getEntryCandidates: getEntryCandidatesDefault(
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
          getEntryCandidates: getEntryCandidatesDefault('#rso > .bkWMgd > div > .g'),
          getURL: getURLDefault('> .s > .DOqJne > .zTpPx > g-link > a'),
          createAction: createActionDefault(
            '> .s > .DOqJne > .qdrjAc.Dwsemf',
            'ub-action-all-twitter',
          ),
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div > div.g'),
          getURL: getURLDefault('> g-section-with-header > div > div > div > div > g-link > a'),
          createAction: createActionDefault(
            '> g-section-with-header > div > div > div > div:nth-child(3)',
            'ub-action-all-twitter',
          ),
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div > div.g'),
          getURL: getURLDefault('> g-section-with-header > div > div > h3.r > g-link > a'),
          createAction: createActionDefault(
            '> g-section-with-header > div > div > div',
            'ub-action-all-twitter-search',
          ),
        },
        // Videos
        {
          getEntryCandidates: getEntryCandidatesDefault(
            'div#rso > div > div > g-section-with-header > div > g-scrolling-carousel > div > div > div > div > g-inner-card',
            1,
          ),
          getURL: getURLDefault('> g-inner-card > div > a'),
          createAction: createActionDefault('> g-inner-card', 'ub-action-all-videos'),
        },
        // Web Result
        {
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-all'),
        },
        // Web Result with Site Links
        {
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div.g'),
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
          getEntryCandidates: getEntryCandidatesDefault('.Yr5TG'),
          getURL: getURLDefault('> .bHexk > a'),
          createAction: createActionDefault('> .bHexk > a', 'ub-action-books'),
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div.srg > div.g'),
          getURL: getURLDefault('> div > div.rc > div.r > a'),
          createAction: createActionDefault('> div > div.rc > div.r', 'ub-action-books'),
        },
        // All
        {
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div.g'),
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
          getEntryCandidates: getEntryCandidatesDefault('div#rg_s > div.rg_bx.rg_di.rg_el.ivg-i'),
          getURL(entryCandidate: HTMLElement): string | null {
            const div = entryCandidate.querySelector(':scope > div.rg_meta.notranslate');
            if (!div) {
              return null;
            }
            return /"ru":"([^"]+)"/.exec(div.textContent!)?.[1] ?? null;
          },
          createAction: createActionDefault('', 'ub-action-images'),
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('div#islrg > div.islrc > div.isv-r'),
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
          getEntryCandidates: getEntryCandidatesDefault('g-card'),
          getURL: getURLDefault('.dbsr > a'),
          createAction: createActionDefault('.pDavDe', 'ub-action-news'),
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('.g > .ts > .gG0TJc'),
          getURL: getURLDefault('> h3.r > a.l'),
          createAction: createActionDefault('> .slp', 'ub-action-news-1'),
          modifyEntry(entry: HTMLElement): void {
            const image = entry.previousElementSibling;
            if (image && !image.querySelector('.f')) {
              entry.insertBefore(image, entry.firstChild);
            }
          },
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('.g > .ts > .card-section'),
          getURL: getURLDefault('> a'),
          createAction: createActionDefault('', 'ub-action-news-1'),
          modifyEntry(entry: HTMLElement): void {
            const viewAll = entry.querySelector('.cWEW3c');
            if (viewAll) {
              const parent = entry.parentElement!;
              const nextSibling = entry.nextSibling;
              const div = document.createElement('div');
              div.style.display = 'inline-block';
              div.appendChild(entry);
              div.appendChild(viewAll);
              parent.insertBefore(div, nextSibling);
            }
          },
        },
        {
          getEntryCandidates: (addedElement: HTMLElement): HTMLElement[] => {
            return addedElement.matches('.g > .ts > a.top') && addedElement.querySelector('.f')
              ? [addedElement]
              : [];
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
          getEntryCandidates: getEntryCandidatesDefault('div#rso > div > div.srg > div.g'),
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
          getEntryCandidates: getEntryCandidatesDefault('div#rso div.xpd'),
          getURL: getURLDefault('> div:first-child a'),
          createAction: createActionDefault('> div:last-child', 'ub-action-mobile-all'),
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('div#main div.xpd'),
          getURL: getURLFromQuery('> div:first-child > a'),
          createAction: createActionDefault('', 'ub-action-mobile-all'),
        },
        {
          getEntryCandidates: getEntryCandidatesDefault('div#ires > ol > div.g'),
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

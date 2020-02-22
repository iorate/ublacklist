import { UAParser } from 'ua-parser-js';
import {
  createActionDefault,
  createControlDefault,
  getAddedElementsDefault,
  getEntriesDefault,
  getURLDefault,
} from '../content-handlers';

function getURLFromQuery(selector: string): (entry: HTMLElement) => string | null {
  return (entry: HTMLElement): string | null => {
    const a = selector ? entry.querySelector(`:scope ${selector}`) : entry;
    if (!a || a.tagName !== 'A') {
      return null;
    }
    const url = (a as HTMLAnchorElement).href;
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
  // All
  case '/':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#mBMHK', 'ub-control_all_v1'),
        },
        {
          createControl: createControlDefault('#resultStats', 'ub-control_all_v1'),
        },
      ],
      entryHandlers: [
        // Default, Web Result
        {
          getEntries: getEntriesDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.eFM0qc', 'ub-action_all_default_v1'),
        },
        {
          getEntries: getEntriesDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.yWc32e', 'ub-action_all_default_v1'),
        },
        {
          getEntries: getEntriesDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
          getURL: getURLDefault('a'),
          // Fall back to the bottom.
          createAction: createActionDefault('', 'ub-action_all_default_v2'),
        },
        // Featured Snippet
        {
          getEntries: getEntriesDefault('.bkWMgd > .g > .kp-blk > .xpdopen > .ifM9O > div > .g', 5),
          getURL: getURLDefault('.r > a'),
          createAction: createActionDefault('.eFM0qc', 'ub-action_all_default_v1'),
        },
        {
          getEntries: getEntriesDefault('.bkWMgd > .g.mnr-c'),
          getURL: getURLDefault('.r > a'),
          createAction: createActionDefault('.yWc32e', 'ub-action_all_default_v1'),
        },
        // Latest, Top Stories (Horizontal)
        {
          getEntries: getEntriesDefault('.So9e7d:nth-child(-n+3) > .ttfMne > .Pd7qJe', 2),
          getURL: getURLDefault('.VlJC0'),
          createAction: createActionDefault('.ttfMne', 'ub-action_all_latest_v1'),
        },
        {
          getEntries: getEntriesDefault('.So9e7d:nth-child(n+4) > .ttfMne', 1),
          getURL: getURLDefault('.VlJC0'),
          createAction: createActionDefault('.ttfMne', 'ub-action_all_latest_v1'),
        },
        // Recipes
        {
          getEntries: getEntriesDefault('.YwonT'),
          getURL: getURLDefault('.a-no-hover-decoration'),
          createAction: createActionDefault('.a-no-hover-decoration', 'ub-action_all_recipes_v1'),
        },
        {
          getEntries: (addedElement: HTMLElement): HTMLElement[] => {
            return addedElement.matches('.yl > div')
              ? Array.from<HTMLElement>(addedElement.querySelectorAll('.YwonT'))
              : [];
          },
          getURL: getURLDefault('.a-no-hover-decoration'),
          createAction: createActionDefault('.a-no-hover-decoration', 'ub-action_all_recipes_v1'),
        },
        // Top Stories (Vertical)
        {
          getEntries: getEntriesDefault(
            'div > div > div > lazy-load-item > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b',
            8,
          ),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.tYlW7b', 'ub-action_all_top-stories-vertical_v1'),
        },
        {
          getEntries: getEntriesDefault('div > div > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b', 6),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.tYlW7b', 'ub-action_all_top-stories-vertical_v1'),
        },
        // Twitter
        {
          getEntries: getEntriesDefault('.bkWMgd > div > .g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.qdrjAc', 'ub-action_all_twitter_v1'),
        },
        // Twitter Search
        {
          getEntries: getEntriesDefault('.bkWMgd > div > .g'),
          getURL: getURLDefault('a'),
          createAction: (entry: HTMLElement): HTMLElement | null => {
            const nextSibling = entry.querySelector('.r');
            if (!nextSibling) {
              return null;
            }
            const action = document.createElement('div');
            action.className = 'ub-action_all_twitter-search_v2';
            nextSibling.parentElement!.insertBefore(action, nextSibling);
            return action;
          },
        },
        {
          getEntries: getEntriesDefault('.bkWMgd > div > .g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.Dwsemf', 'ub-action_all_twitter-search_v1'),
        },
        // Videos
        {
          getEntries: getEntriesDefault('.P94G9b > .ZTH1s', 1),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.ZTH1s', 'ub-action_all_video_v1'),
        },
      ],
      autoPagerizeHandlers: [
        {
          getAddedElements: getAddedElementsDefault('.g'),
        },
      ],
    };
    break;

  // Books
  case '/bks':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#mBMHK', 'ub-control_books_v1'),
        },
        {
          createControl: createControlDefault('#resultStats', 'ub-control_books_v1'),
        },
      ],
      entryHandlers: [
        {
          getEntries: getEntriesDefault('.Yr5TG'),
          getURL: getURLDefault('.bHexk > a'),
          createAction: createActionDefault('.eFM0qc', 'ub-action_books_default_v1'),
        },
        {
          getEntries: getEntriesDefault('.g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.eFM0qc', 'ub-action_books_default_v1'),
        },
        {
          getEntries: getEntriesDefault('.g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.yWc32e', 'ub-action_books_default_v1'),
        },
      ],
      autoPagerizeHandlers: [
        {
          getAddedElements: getAddedElementsDefault('.g'),
        },
      ],
    };
    break;

  // Images
  case '/isch':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('.cj2HCb', 'ub-control_images_v2'),
        },
        {
          createControl(): HTMLElement | null {
            const parent = document.getElementById('ab_ctls') as HTMLElement | null;
            if (!parent) {
              return null;
            }
            const control = document.createElement('li');
            control.className = 'ab_ctl ub-control_images_v1';
            parent.appendChild(control);
            return control;
          },
        },
      ],
      entryHandlers: [
        {
          getEntries: getEntriesDefault('.isv-r'),
          getURL: getURLDefault('.VFACy'),
          createAction: createActionDefault('', 'ub-action_images_default_v1'),
        },
        {
          getEntries: getEntriesDefault('.rg_bx'),
          getURL(entry: HTMLElement): string | null {
            const div = entry.querySelector('.rg_meta');
            if (!div) {
              return null;
            }
            return /"ru":"([^"]+)"/.exec(div.textContent!)?.[1] ?? null;
          },
          createAction: createActionDefault('', 'ub-action_images_default_v1'),
        },
      ],
    };
    break;

  // News
  case '/nws':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#mBMHK', 'ub-control_news_v1'),
        },
        {
          createControl: createControlDefault('#resultStats', 'ub-control_news_v1'),
        },
      ],
      entryHandlers: [
        {
          getEntries: getEntriesDefault('.nChh6e'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.pDavDe', 'ub-action_news_default_v2'),
        },
        {
          getEntries: getEntriesDefault('.gG0TJc'),
          getURL: getURLDefault('.l'),
          createAction: createActionDefault('.slp', 'ub-action_news_default_v1'),
          adjustEntry(entry: HTMLElement): void {
            const image = entry.previousElementSibling;
            if (image && !image.querySelector('.Y6GIfb')) {
              entry.insertBefore(image, entry.firstChild);
            }
          },
        },
        {
          getEntries: getEntriesDefault('.YiHbdc, .ErI7Gd'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('', 'ub-action_news_default_v1'),
          adjustEntry(entry: HTMLElement): void {
            const viewAll = entry.querySelector('.cWEW3c');
            if (!viewAll) {
              return;
            }
            const parent = entry.parentElement!;
            const nextSibling = entry.nextSibling;
            const div = document.createElement('div');
            div.style.display = 'inline-block';
            div.appendChild(entry);
            div.appendChild(viewAll);
            parent.insertBefore(div, nextSibling);
          },
        },
        {
          getEntries: (addedElement: HTMLElement): HTMLElement[] => {
            return addedElement.matches('.top') && addedElement.querySelector('.Y6GIfb')
              ? [addedElement]
              : [];
          },
          getURL: getURLDefault(''),
          createAction: createActionDefault('', 'ub-action_news_image_v1'),
        },
      ],
      autoPagerizeHandlers: [
        {
          getAddedElements: getAddedElementsDefault('.nChh6e, .gG0TJc, .YiHbdc, .ErI7Gd, .top'),
        },
      ],
    };
    break;

  // Videos
  case '/vid':
    window.ubContentHandlers = {
      controlHandlers: [
        {
          createControl: createControlDefault('#mBMHK', 'ub-control_videos_v1'),
        },
        {
          createControl: createControlDefault('#resultStats', 'ub-control_videos_v1'),
        },
      ],
      entryHandlers: [
        {
          getEntries: getEntriesDefault('.g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('.r', 'ub-action_videos_default_v1'),
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
          getEntries: getEntriesDefault('div#rso div.xpd'),
          getURL: getURLDefault('> div:first-child a'),
          createAction: createActionDefault('> div:last-child', 'ub-action-mobile-all'),
        },
        {
          getEntries: getEntriesDefault('div#main div.xpd'),
          getURL: getURLFromQuery('> div:first-child > a'),
          createAction: createActionDefault('', 'ub-action-mobile-all'),
        },
        {
          getEntries: getEntriesDefault('div#ires > ol > div.g'),
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

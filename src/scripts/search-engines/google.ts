import { SearchEngine, SearchEngineHandlers } from '../types';
import {
  createAction,
  createControl,
  createControlBefore,
  getEntry,
  getParent,
  getSilentlyAddedElements,
  getURL,
} from './helpers';
import { googleMatches } from '../../google-matches';
import googleStyle from '!!raw-loader!extract-loader!css-loader!sass-loader!../../styles/search-engines/google.scss';

function getURLFromQuery(selector: string): (entry: HTMLElement) => string | null {
  return entry => {
    const a = selector ? entry.querySelector(selector) : entry;
    if (!(a instanceof HTMLAnchorElement)) {
      return null;
    }
    try {
      const u = new URL(a.href, window.location.href);
      if (u.pathname !== '/url') {
        return null;
      }
      return u.searchParams.get('q');
    } catch {
      return null;
    }
  };
}

const pcHandlers: Record<string, SearchEngineHandlers | undefined> = {
  // All
  '': {
    controlHandlers: [
      {
        createControl: createControl('ub-pc-all-control', '#result-stats'),
      },
    ],
    entryHandlers: [
      // General, Web Result
      {
        getEntry: addedElement => {
          if (!addedElement.matches('.g .s, .g .IsZvec')) {
            return null;
          }
          const entry = addedElement.closest('.g') as HTMLElement;
          if (entry.matches('.g *')) {
            // Featured Snippet, People Also Ask, ...?
            return null;
          }
          return entry;
        },
        getURL: getURL('.rc a'),
        createAction: entry => {
          const parent = entry.querySelector('.eFM0qc');
          const action = document.createElement('div');
          if (parent) {
            action.className = 'ub-pc-all-general-action';
            parent.appendChild(action);
          } else {
            action.className = 'ub-pc-all-general-action-fallback';
            entry.appendChild(action);
          }
          return action;
        },
      },
      // Featured Snippet
      {
        getEntry: getEntry('.g > .kp-blk > .xpdopen > .ifM9O > div > .g', 5),
        getURL: getURL('.rc a'),
        createAction: createAction('ub-pc-all-general-action', '.eFM0qc'),
      },
      {
        getEntry: getEntry('.ifM9O > div > .NFQFxe'),
        getURL: getURL('.rc a'),
        createAction: createAction('ub-pc-all-general-action', '.eFM0qc'),
      },
      // Latest
      {
        getEntry: addedElement => {
          if (!addedElement.matches('.So9e7d > .ttfMne')) {
            return null;
          }
          const entry = getParent(addedElement);
          if (entry.matches('.UDZeY *')) {
            // Map from the Web (COVID-19)
            return null;
          }
          return entry;
        },
        getURL: getURL('.VlJC0'),
        createAction: createAction('ub-pc-all-latest-action', '.ttfMne'),
      },
      // People Also Ask
      {
        getEntry: addedElement => {
          if (
            !addedElement.matches(
              '.related-question-pair > g-accordion-expander > .gy6Qzb > div > div > .g',
            )
          ) {
            return null;
          }
          const entry = getParent(addedElement, 5);
          if (entry.matches('.UDZeY *')) {
            // Common Question (COVID-19)
            return null;
          }
          return entry;
        },
        getURL: getURL('.rc a'),
        createAction: createAction('ub-pc-all-paa-action', '.eFM0qc'),
      },
      // Quote in the News
      {
        getEntry: getEntry('.UaDxmd > .F4CzCf', 1),
        getURL: getURL('.YVkwvd'),
        createAction: createAction('ub-pc-all-quote-action', '.FF4Vu'),
      },
      // Recipe
      {
        getEntry: getEntry('.YwonT'),
        getURL: getURL('.a-no-hover-decoration'),
        createAction: createAction('ub-pc-all-recipe-action', '.a-no-hover-decoration'),
      },
      // Top Story (Horizontal)
      {
        getEntry: getEntry('.JJZKK > .kno-fb-ctx', 1),
        getURL: getURL('a'),
        createAction: createAction('ub-pc-all-top-story-action-horizontal', '.kno-fb-ctx'),
      },
      // Top Story (Vertical)
      {
        getEntry: getEntry(
          'div > div > div > lazy-load-item > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b',
          8,
        ),
        getURL: getURL('a'),
        createAction: createAction('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
      },
      {
        getEntry: getEntry('div > div > .dbsr > a > div > div > .tYlW7b', 6),
        getURL: getURL('a'),
        createAction: createAction('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
      },
      // Twitter
      {
        getEntry: getEntry('.g'),
        getURL: getURL('.zTpPx > g-link > a'),
        createAction: entry => {
          const q = entry.querySelector('.qdrjAc');
          if (q) {
            // Twitter
            const action = document.createElement('div');
            action.className = 'ub-pc-all-twitter-action';
            q.appendChild(action);
            return action;
          }
          const r = entry.querySelector<HTMLElement>('.ellip + .r');
          if (r) {
            // Twitter Search
            const action = document.createElement('div');
            action.className = 'ub-pc-all-twitter-search-action';
            getParent(r).insertBefore(action, r);
            return action;
          }
          const d = entry.querySelector('.Dwsemf');
          if (d) {
            // Twitter Search (Favicon)
            const action = document.createElement('div');
            action.className = 'ub-pc-all-twitter-search-action-favicon';
            d.appendChild(action);
            return action;
          }
          return null;
        },
      },
      // Video
      {
        getEntry: getEntry('.gT5me > .ZTH1s', 1),
        getURL: getURL('a'),
        createAction: createAction('ub-pc-all-video-action', '.ZTH1s'),
      },
      // News (COVID-19)
      {
        getEntry: getEntry('div > .XBBQi + .dbsr, div > .AxkxJb + .dbsr', 1),
        getURL: getURL('.dbsr > a'),
        createAction: createAction('ub-pc-all-news-action-covid-19', '.XTjFC'),
      },
      {
        getEntry: getEntry('div > .nChh6e > div > div > div + .dbsr', 4),
        getURL: getURL('.dbsr > a'),
        createAction: createAction('ub-pc-all-news-action-covid-19', '.XTjFC'),
      },
      // People Also Search For (COVID-19)
      {
        getEntry: getEntry('.F9rcV'),
        getURL: getURL('.Tsx23b'),
        createAction: createAction('ub-pc-all-pasf-action-covid-19', '.Tsx23b'),
      },
      // Top Story (Vertical, COVID-19)
      {
        getEntry: getEntry('.bh13Qc > .cv2VAd > div > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b', 7),
        getURL: getURL('a'),
        createAction: createAction('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
      },
    ],
    getSilentlyAddedElements: getSilentlyAddedElements({
      // People Also Ask
      '.related-question-pair': '.g',
      // Recipe, General (COVID-19), Web Result (COVID-19), ...
      '.yl > div': '.YwonT, .s, .IsZvec, .dbsr, .F9rcV, .kno-fb-ctx, .tYlW7b, .ZTH1s',
      // AutoPagerize
      '.autopagerize_page_info ~ .g': '.s, .IsZvec',
    }),
  },
  // Books
  bks: {
    controlHandlers: [
      {
        createControl: createControl('ub-pc-books-control', '#result-stats'),
      },
    ],
    entryHandlers: [
      // General
      {
        getEntry: getEntry('.Yr5TG'),
        getURL: getURL('.bHexk > a'),
        createAction: createAction('ub-pc-books-general-action', '.eFM0qc'),
      },
      // General (Japanese)
      {
        getEntry: getEntry('.g'),
        getURL: getURL('a'),
        createAction: createAction('ub-pc-books-general-action', '.eFM0qc'),
      },
    ],
  },
  // Images
  isch: {
    controlHandlers: [
      {
        createControl: createControlBefore('ub-pc-images-control', '.FAZ4xe'),
      },
      {
        createControl: createControlBefore('ub-pc-images-control-sensitive', '.mJxzWe'),
      },
    ],
    entryHandlers: [
      // General
      {
        getEntry: getEntry('.isv-r'),
        getURL: getURL('.VFACy'),
        createAction: createAction('ub-pc-images-general-action', ''),
        adjustEntry: entry => {
          const q = entry.querySelector<HTMLElement>('.VFACy');
          if (!q) {
            return;
          }
          q.style.verticalAlign = 'bottom';
        },
      },
    ],
  },
  // News
  nws: {
    controlHandlers: [
      {
        createControl: createControl('ub-pc-news-control', '#result-stats'),
      },
    ],
    entryHandlers: [
      // General
      {
        getEntry: getEntry('div > .XBBQi + .dbsr, div > .AxkxJb + .dbsr', 1),
        getURL: getURL('.dbsr > a'),
        createAction: createAction('ub-pc-news-general-action', '.XTjFC'),
      },
      {
        getEntry: getEntry('div > .nChh6e > div > div > .dbsr', 4),
        getURL: getURL('.dbsr > a'),
        createAction: createAction('ub-pc-news-general-action', '.XTjFC'),
      },
      {
        getEntry: getEntry('.nChh6e > div > .dbsr', 2),
        getURL: getURL('.dbsr > a'),
        createAction: createAction('ub-pc-news-general-action', '.XTjFC'),
      },
      // People Also Search For
      {
        getEntry: getEntry('.F9rcV'),
        getURL: getURL('.Tsx23b'),
        createAction: createAction('ub-pc-news-pasf-action', '.Tsx23b'),
      },
      // General (Japanese)
      {
        getEntry: getEntry('.gG0TJc'),
        getURL: getURL('.l'),
        createAction: createAction('ub-pc-news-general-action-japanese', '.dhIWPd'),
        adjustEntry: entry => {
          const image = getParent(entry).querySelector('.top');
          if (!image || image.querySelector('.Y6GIfb')) {
            return;
          }
          entry.insertBefore(image, entry.firstChild);
        },
      },
      {
        getEntry: getEntry('.YiHbdc, .ErI7Gd'),
        getURL: getURL('a'),
        createAction: createAction('ub-pc-news-general-action-japanese', ''),
        adjustEntry: entry => {
          const viewAll = entry.querySelector('.cWEW3c');
          if (!viewAll) {
            return;
          }
          const parent = getParent(entry);
          const nextSibling = entry.nextSibling;
          const div = document.createElement('div');
          div.style.display = 'inline-block';
          div.appendChild(entry);
          div.appendChild(viewAll);
          parent.insertBefore(div, nextSibling);
        },
      },
      // Image (Japanese)
      {
        getEntry: addedElement => {
          if (!addedElement.matches('.top') || !addedElement.querySelector(':scope > .Y6GIfb')) {
            return null;
          }
          return addedElement;
        },
        getURL: getURL(''),
        createAction: createAction('ub-pc-news-image-action-japanese', ''),
      },
    ],
    getSilentlyAddedElements: getSilentlyAddedElements({
      // AutoPagerize
      '.autopagerize_page_info ~ div': '.dbsr, .gG0TJc, .YiHbdc, .ErI7Gd, .top',
    }),
  },
  // Videos
  vid: {
    controlHandlers: [
      {
        createControl: createControl('ub-pc-videos-control', '#result-stats'),
      },
    ],
    entryHandlers: [
      // General
      {
        getEntry: getEntry('.g > .rc > .s', 2),
        getURL: getURL('.r > a'),
        createAction: createAction('ub-pc-videos-general-action', '.eFM0qc'),
      },
    ],
    getSilentlyAddedElements: getSilentlyAddedElements({
      // AutoPagerize
      '.autopagerize_page_info ~ .g': '.s',
    }),
  },
};

const mobileHandlers: Record<string, SearchEngineHandlers | undefined> = {
  // All
  '': {
    controlHandlers: [
      {
        createControl: createControlBefore('ub-mobile-all-control', '#main > div:nth-child(4)'),
      },
    ],
    entryHandlers: [
      // General, Featured Snippet, Video
      {
        getEntry: getEntry('.xpd'),
        getURL: getURLFromQuery(':scope > .kCrYT > a'),
        createAction: createAction('ub-mobile-all-general-action', ''),
      },
      // Latest
      {
        getEntry: addedElement => {
          if (
            !addedElement.matches('.BVG0Nb') ||
            !addedElement.querySelector('.S7Jdze:last-child')
          ) {
            return null;
          }
          return addedElement;
        },
        getURL: getURLFromQuery(''),
        createAction: createAction('ub-mobile-all-latest-action', ''),
      },
      // People Also Ask
      {
        getEntry: getEntry('.xpc > .qxDOhb > .hwc', 2),
        getURL: getURLFromQuery('.kCrYT > a'),
        createAction: createAction('ub-mobile-all-paa-action', '.xpd'),
      },
      // Top Story (Horizontal), Twitter Search
      {
        getEntry: addedElement => {
          if (
            !addedElement.matches('.BVG0Nb') ||
            // Twitter
            addedElement.closest('.xpd')?.querySelector('.AzGoi')
          ) {
            return null;
          }
          return addedElement;
        },
        getURL: getURLFromQuery(''),
        createAction: createAction('ub-mobile-all-top-story-action', ''),
      },
      // Top Story (Vertical)
      {
        getEntry: getEntry('.X7NTVe'),
        getURL: getURLFromQuery('.tHmfQe'),
        createAction: createAction('ub-mobile-all-top-story-action-vertical', '.tHmfQe'),
      },
      // Twitter
      {
        getEntry: addedElement => {
          if (
            !addedElement.matches('.xpd') ||
            !addedElement.querySelector(':scope > div:first-child > a > .kCrYT')
          ) {
            return null;
          }
          return addedElement;
        },
        getURL: getURLFromQuery('a'),
        createAction: createAction('ub-mobile-all-twitter-action', ''),
      },
    ],
  },
  // Books
  bks: {
    controlHandlers: [
      {
        createControl: createControlBefore('ub-mobile-books-control', '#main > div:nth-child(4)'),
      },
    ],
    entryHandlers: [
      {
        getEntry: getEntry('.xpd'),
        getURL: getURL('.kCrYT > a'),
        createAction: createAction('ub-mobile-books-general-action', ''),
      },
    ],
  },
  // Images
  isch: {
    controlHandlers: [
      {
        createControl: createControlBefore('ub-mobile-images-control', '.dmFHw'),
      },
    ],
    entryHandlers: [
      {
        getEntry: getEntry('.islrtb'),
        getURL: getURLFromQuery('.iKjWAf'),
        createAction: createAction('ub-mobile-images-general-action', ''),
      },
    ],
  },
  // News
  nws: {
    controlHandlers: [
      {
        createControl: createControlBefore('ub-mobile-news-control', '#main > div:nth-child(4)'),
      },
    ],
    entryHandlers: [
      {
        getEntry: getEntry('.xpd'),
        getURL: getURLFromQuery('.kCrYT > a'),
        createAction: createAction('ub-mobile-news-general-action', ''),
      },
    ],
  },
  // Videos
  vid: {
    controlHandlers: [
      {
        createControl: createControlBefore('ub-mobile-videos-control', '#main > div:nth-child(4)'),
      },
    ],
    entryHandlers: [
      {
        getEntry: getEntry('.xpd'),
        getURL: getURLFromQuery('.kCrYT > a'),
        createAction: createAction('ub-mobile-videos-general-action', ''),
      },
    ],
  },
};

export const google: SearchEngine = {
  matches: googleMatches,
  messageNames: {
    name: 'extensionName', // never used
  },
  style: googleStyle,

  getHandlers: (url, mobile) => {
    const tbm = new URL(url).searchParams.get('tbm') ?? '';
    return (mobile ? mobileHandlers : pcHandlers)[tbm] ?? null;
  },
};

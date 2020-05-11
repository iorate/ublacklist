import mobile from 'is-mobile';
import {
  ContentHandlers,
  createActionUnder,
  createControlBefore,
  createControlUnder,
  getDynamicElements,
  getEntry,
  getURL,
} from '../content-handlers';

function getURLFromQuery(selector: string): (entry: HTMLElement) => string | null {
  return entry => {
    const a = selector ? entry.querySelector(selector) : entry;
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

const tbm = new URL(window.location.href).searchParams.get('tbm') ?? '';
let tbmToContentHandlers!: Record<string, ContentHandlers | undefined>;
if (!mobile({ tablet: true })) {
  // #region PC
  tbmToContentHandlers = {
    // All
    '': {
      controlHandlers: [
        {
          createControl: createControlUnder('ub-pc-all-control', '#result-stats'),
        },
      ],
      entryHandlers: [
        // General, Web Result, Featured Snippet
        {
          getEntry: addedElement => {
            if (!addedElement.matches('.s')) {
              return null;
            }
            const g = addedElement.closest('.g') as HTMLElement | null;
            if (!g) {
              return null;
            }
            const featuredSnippet = g.parentElement!.closest('.g') as HTMLElement | null;
            return featuredSnippet ?? g;
          },
          getURL: getURL('.r > a'),
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
        // Latest
        {
          getEntry: addedElement => {
            if (!addedElement.matches('.ttfMne') || addedElement.closest('.UDZeY')) {
              return null;
            }
            return addedElement.parentElement as HTMLElement;
          },
          getURL: getURL('.VlJC0'),
          createAction: createActionUnder('ub-pc-all-latest-action', '.ttfMne'),
        },
        // News (COVID-19)
        {
          getEntry: getEntry('.XBBQi + .dbsr, .AxkxJb + .dbsr', 1),
          getURL: getURL('.dbsr > a'),
          createAction: createActionUnder('ub-pc-all-news-action-covid-19', '.XTjFC'),
        },
        {
          getEntry: getEntry('div + .dbsr', 4),
          getURL: getURL('.dbsr > a'),
          createAction: createActionUnder('ub-pc-all-news-action-covid-19', '.XTjFC'),
        },
        {
          getEntry: getEntry('.F9rcV'),
          getURL: getURL('.Tsx23b'),
          createAction: createActionUnder('ub-pc-all-pasf-action-covid-19', '.Tsx23b'),
        },
        // Quote
        {
          getEntry: getEntry('.nHArSb', 1),
          getURL: getURL('.r7Cfx'),
          createAction: createActionUnder('ub-pc-all-quote-action', '.Uehmsf'),
        },
        // Recipe
        {
          getEntry: getEntry('.YwonT'),
          getURL: getURL('.a-no-hover-decoration'),
          createAction: createActionUnder('ub-pc-all-recipe-action', '.a-no-hover-decoration'),
        },
        // Top Story (Horizontal)
        {
          getEntry: getEntry('.kno-fb-ctx', 1),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-top-story-action-horizontal', '.kno-fb-ctx'),
        },
        // Top Story (Vertical)
        {
          getEntry: getEntry('.cv2VAd > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b', 6),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
        },
        {
          getEntry: getEntry('lazy-load-item > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b', 8),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
        },
        {
          getEntry: getEntry('div > .dbsr > a > div > div > .tYlW7b', 6),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
        },
        // Twitter
        {
          getEntry: getEntry('#rso > div > .g'),
          getURL: getURL('g-link > a'),
          createAction: createActionUnder('ub-pc-all-twitter-action', '.qdrjAc'),
        },
        // Twitter Search
        {
          getEntry: getEntry('#rso > div > .g'),
          getURL: getURL('g-link > a'),
          createAction: entry => {
            const r = entry.querySelector('.ellip + .r');
            if (r) {
              const action = document.createElement('div');
              action.className = 'ub-pc-all-twitter-search-action';
              r.parentElement!.insertBefore(action, r);
              return action;
            }
            const dwsemf = entry.querySelector('.Dwsemf');
            if (dwsemf) {
              const action = document.createElement('div');
              action.className = 'ub-pc-all-twitter-search-action-favicon';
              dwsemf.appendChild(action);
              return action;
            }
            return null;
          },
        },
        // Video
        {
          getEntry: getEntry('.P94G9b > .ZTH1s', 1),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-video-action', '.ZTH1s'),
        },
      ],
      dynamicElementHandlers: [
        // COVID-19, Recipe
        {
          getDynamicElements: getDynamicElements(
            '.yl > div',
            '.s, .Pd7qJe, .ttfMne, .dbsr, .F9rcV, .kno-fb-ctx, .tYlW7b, .YwonT',
          ),
        },
        // AutoPagerize
        {
          getDynamicElements: getDynamicElements('.autopagerize_page_info ~ .g', '.s'),
        },
      ],
    },
    // Books
    bks: {
      controlHandlers: [
        {
          createControl: createControlUnder('ub-pc-books-control', '#result-stats'),
        },
      ],
      entryHandlers: [
        // General
        {
          getEntry: getEntry('.Yr5TG'),
          getURL: getURL('.bHexk > a'),
          createAction: createActionUnder('ub-pc-books-general-action', '.eFM0qc'),
        },
        // General (Japanese)
        {
          getEntry: getEntry('.g'),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-books-general-action', '.eFM0qc'),
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
          createAction: createActionUnder('ub-pc-images-general-action', ''),
          adjustEntry: entry => {
            entry.querySelector<HTMLElement>('.VFACy')!.style.verticalAlign = 'bottom';
          },
        },
      ],
    },
    // News
    nws: {
      controlHandlers: [
        {
          createControl: createControlUnder('ub-pc-news-control', '#result-stats'),
        },
      ],
      entryHandlers: [
        // General
        {
          getEntry: getEntry('.XBBQi + .dbsr, .AxkxJb + .dbsr', 1),
          getURL: getURL('.dbsr > a'),
          createAction: createActionUnder('ub-pc-news-general-action', '.XTjFC'),
        },
        {
          getEntry: getEntry('.dbsr', 4),
          getURL: getURL('.dbsr > a'),
          createAction: createActionUnder('ub-pc-news-general-action', '.XTjFC'),
        },
        // PASF
        {
          getEntry: getEntry('.F9rcV'),
          getURL: getURL('.Tsx23b'),
          createAction: createActionUnder('ub-pc-news-pasf-action', '.Tsx23b'),
        },
        // General (Japanese)
        {
          getEntry: getEntry('.gG0TJc'),
          getURL: getURL('.l'),
          createAction: createActionUnder('ub-pc-news-general-action-japanese', '.dhIWPd'),
          adjustEntry: entry => {
            const image = entry.parentElement!.querySelector('.top');
            if (!image || image.querySelector('.Y6GIfb')) {
              return;
            }
            entry.insertBefore(image, entry.firstChild);
          },
        },
        {
          getEntry: getEntry('.YiHbdc, .ErI7Gd'),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-news-general-action-japanese', ''),
          adjustEntry: entry => {
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
          getEntry: addedElement => {
            if (!addedElement.matches('.top') || !addedElement.querySelector('.Y6GIfb')) {
              return null;
            }
            return addedElement;
          },
          getURL: getURL(''),
          createAction: createActionUnder('ub-pc-news-image-action-japanese', ''),
        },
      ],
      // AutoPagerize
      dynamicElementHandlers: [
        {
          getDynamicElements: getDynamicElements(
            '.autopagerize_page_info ~ div',
            '.dbsr, .gG0TJc, .YiHbdc, .ErI7Gd, .top',
          ),
        },
      ],
    },
    // Videos
    vid: {
      controlHandlers: [
        {
          createControl: createControlUnder('ub-pc-videos-control', '#result-stats'),
        },
      ],
      entryHandlers: [
        // General
        {
          getEntry: getEntry('.g'),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-videos-general-action', '.r'),
        },
      ],
    },
  };
  // #endregion PC
} else {
  // #region Mobile
  tbmToContentHandlers = {
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
          createAction: createActionUnder('ub-mobile-all-general-action', ''),
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
          createAction: createActionUnder('ub-mobile-all-latest-action', ''),
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
          createAction: createActionUnder('ub-mobile-all-top-story-action', ''),
        },
        // Top Story (Vertical)
        {
          getEntry: getEntry('.X7NTVe'),
          getURL: getURLFromQuery('.tHmfQe'),
          createAction: createActionUnder('ub-mobile-all-top-story-action-vertical', '.tHmfQe'),
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
          createAction: createActionUnder('ub-mobile-all-twitter-action', ''),
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
          createAction: createActionUnder('ub-mobile-books-general-action', ''),
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
          createAction: createActionUnder('ub-mobile-images-general-action', ''),
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
          createAction: createActionUnder('ub-mobile-news-general-action', ''),
        },
      ],
    },
    // Videos
    vid: {
      controlHandlers: [
        {
          createControl: createControlBefore(
            'ub-mobile-videos-control',
            '#main > div:nth-child(4)',
          ),
        },
      ],
      entryHandlers: [
        {
          getEntry: getEntry('.xpd'),
          getURL: getURLFromQuery('.kCrYT > a'),
          createAction: createActionUnder('ub-mobile-videos-general-action', ''),
        },
      ],
    },
  };
  // #endregion Mobile
}
window.ubContentHandlers = tbmToContentHandlers[tbm] ?? null;

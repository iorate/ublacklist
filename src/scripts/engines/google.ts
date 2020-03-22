import mobile from 'is-mobile';
import {
  ContentHandlers,
  createActionBefore,
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
        // General, Web Result
        {
          getEntry: getEntry('.srg > .g, #rso > .g:not(.mnr-c), .bkWMgd > .g:not(.mnr-c)'),
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
        // Featured Snippet
        {
          getEntry: getEntry('.g.mnr-c > .kp-blk > .xpdopen > .ifM9O > div > .g', 5),
          getURL: getURL('.r > a'),
          createAction: createActionUnder('ub-pc-all-general-action', '.eFM0qc'),
        },
        // Latest, Top Story (Horizontal)
        {
          getEntry: getEntry('.So9e7d:nth-child(-n+3) > .ttfMne > .Pd7qJe', 2),
          getURL: getURL('.VlJC0'),
          createAction: createActionUnder('ub-pc-all-latest-action', '.ttfMne'),
        },
        {
          getEntry: getEntry('.So9e7d:nth-child(n+4) > .ttfMne', 1),
          getURL: getURL('.VlJC0'),
          createAction: createActionUnder('ub-pc-all-latest-action', '.ttfMne'),
        },
        // Recipe
        {
          getEntry: getEntry('.YwonT'),
          getURL: getURL('.a-no-hover-decoration'),
          createAction: createActionUnder('ub-pc-all-recipe-action', '.a-no-hover-decoration'),
        },
        // Top Story (Vertical)
        {
          getEntry: getEntry(
            'div > div > div > lazy-load-item > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b',
            8,
          ),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
        },
        {
          getEntry: getEntry('div > div > .dbsr > a > div > div > .tYlW7b', 6),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
        },
        // Twitter
        {
          getEntry: getEntry('#rso > div > .g, .bkWMgd > div > .g'),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-twitter-action', '.qdrjAc'),
        },
        // Twitter Search
        {
          getEntry: getEntry('#rso > div > .g, .bkWMgd > div > .g'),
          getURL: getURL('a'),
          createAction: createActionBefore('ub-pc-all-twitter-search-action', '.r'),
        },
        // Video
        {
          getEntry: getEntry('.P94G9b > .ZTH1s', 1),
          getURL: getURL('a'),
          createAction: createActionUnder('ub-pc-all-video-action', '.ZTH1s'),
        },
      ],
      dynamicElementHandlers: [
        // Recipe
        {
          getDynamicElements: getDynamicElements('.yl > div', '.YwonT'),
        },
        // AutoPagerize
        {
          getDynamicElements: getDynamicElements(
            '.autopagerize_page_info + #res, .autopagerize_page_info ~ .bkWMgd',
            '.g',
          ),
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
      dynamicElementHandlers: [
        // AutoPagerize
        {
          getDynamicElements: getDynamicElements(
            '.autopagerize_page_info + #res, .autopagerize_page_info + .bkWMgd',
            '.Yr5TG, .g',
          ),
        },
      ],
    },
    // Images
    isch: {
      controlHandlers: [
        {
          createControl: createControlBefore('ub-pc-images-control', '.ymoOte'),
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
          getEntry: getEntry('#rso > div, .bkWMgd'),
          getURL: getURL('.dbsr > a'),
          createAction: createActionUnder('ub-pc-news-general-action', '.pDavDe'),
        },
        // General (Japanese)
        {
          getEntry: getEntry('.gG0TJc'),
          getURL: getURL('.l'),
          createAction: createActionUnder('ub-pc-news-general-action-japanese', '.slp'),
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
            '.autopagerize_page_info + #res, .autopagerize_page_info + .bkWMgd',
            '#rso > div, .gG0TJc, .YiHbdc, .ErI7Gd, .top',
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
      dynamicElementHandlers: [
        // AutoPagerize
        {
          getDynamicElements: getDynamicElements(
            '.autopagerize_page_info + #res, .autopagerize_page_info + .bkWMgd',
            '.g',
          ),
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
              !addedElement.querySelector(':scope > div > a > .kCrYT')
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

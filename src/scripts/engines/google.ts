import mobile from 'is-mobile';
import {
  ContentHandlers,
  createActionDefault,
  createControlBefore,
  createControlDefault,
  getAddedElementsDefault,
  getContainerDefault,
  getEntryDefault,
  getURLDefault,
} from '../content-handlers';

function getURLFromQuery(selector?: string): (entry: HTMLElement) => string | null {
  return entry => {
    const a = selector != null ? entry.querySelector(selector) : entry;
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
          createControl: createControlDefault(
            'ub-pc-all-control',
            '#result-stats, #mBMHK, #resultStats',
          ),
        },
      ],
      entryHandlers: [
        // General, Web Result
        {
          getEntry: getEntryDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-general-action', '.eFM0qc'),
        },
        {
          getEntry: getEntryDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-general-action', '.yWc32e'),
        },
        {
          getEntry: getEntryDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-general-action-fallback'),
        },
        // Featured Snippet
        {
          getEntry: getEntryDefault('.bkWMgd > .g > .kp-blk > .xpdopen > .ifM9O > div > .g', 5),
          getURL: getURLDefault('.r > a'),
          createAction: createActionDefault('ub-pc-all-general-action', '.eFM0qc'),
        },
        {
          getEntry: getEntryDefault('.bkWMgd > .g.mnr-c'),
          getURL: getURLDefault('.r > a'),
          createAction: createActionDefault('ub-pc-all-general-action', '.yWc32e'),
        },
        // Latest, Top Story
        {
          getEntry: getEntryDefault('.So9e7d:nth-child(-n+3) > .ttfMne > .Pd7qJe', 2),
          getURL: getURLDefault('.VlJC0'),
          createAction: createActionDefault('ub-pc-all-latest-action', '.ttfMne'),
        },
        {
          getEntry: getEntryDefault('.So9e7d:nth-child(n+4) > .ttfMne', 1),
          getURL: getURLDefault('.VlJC0'),
          createAction: createActionDefault('ub-pc-all-latest-action', '.ttfMne'),
        },
        // Recipe
        {
          getEntry: getEntryDefault('.YwonT'),
          getURL: getURLDefault('.a-no-hover-decoration'),
          createAction: createActionDefault('ub-pc-all-recipe-action', '.a-no-hover-decoration'),
        },
        // Top Story
        {
          getEntry: getEntryDefault(
            'div > div > div > lazy-load-item > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b',
            8,
          ),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-top-story-action-vertical', '.tYlW7b'),
        },
        {
          getEntry: getEntryDefault('div > div > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b', 6),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-top-story-action', '.tYlW7b'),
        },
        // Twitter
        {
          getEntry: getEntryDefault('.bkWMgd > div > .g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-twitter-action', '.qdrjAc'),
        },
        // Twitter Search
        {
          getEntry: getEntryDefault('.bkWMgd > div > .g'),
          getURL: getURLDefault('a'),
          createAction: entry => {
            const nextSibling = entry.querySelector('.r');
            if (!nextSibling) {
              return null;
            }
            const action = document.createElement('div');
            action.className = 'ub-pc-all-twitter-search-action';
            nextSibling.parentElement!.insertBefore(action, nextSibling);
            return action;
          },
        },
        {
          getEntry: getEntryDefault('.bkWMgd > div > .g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-twitter-search-action-previous', '.Dwsemf'),
        },
        // Video
        {
          getEntry: getEntryDefault('.P94G9b > .ZTH1s', 1),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-all-video-action', '.ZTH1s'),
        },
      ],
      containerHandlers: [
        // Recipe
        {
          getContainer: getContainerDefault('.yl > div'),
          getAddedElements: getAddedElementsDefault('.YwonT'),
        },
        // AutoPagerize
        {
          getContainer: getContainerDefault('.autopagerize_page_info + .bkWMgd'),
          getAddedElements: getAddedElementsDefault('.g'),
        },
      ],
    },
    // Books
    bks: {
      controlHandlers: [
        {
          createControl: createControlDefault(
            'ub-pc-books-control',
            '#result-stats, #mBMHK, #resultStats',
          ),
        },
      ],
      entryHandlers: [
        {
          getEntry: getEntryDefault('.Yr5TG'),
          getURL: getURLDefault('.bHexk > a'),
          createAction: createActionDefault('ub-pc-books-general-action', '.eFM0qc'),
        },
        {
          getEntry: getEntryDefault('.g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-books-general-action', '.eFM0qc'),
        },
      ],
      containerHandlers: [
        {
          getContainer: getContainerDefault('.autopagerize_page_info + .bkWMgd'),
          getAddedElements: getAddedElementsDefault('.Yr5TG, .g'),
        },
      ],
    },
    // Images
    isch: {
      controlHandlers: [
        {
          createControl: createControlBefore('ub-pc-images-control', '.ymoOte'),
        },
        {
          createControl: () => {
            const parent = document.getElementById('ab_ctls') as HTMLElement | null;
            if (!parent) {
              return null;
            }
            const control = document.createElement('li');
            control.className = 'ub-pc-images-control-previous ab_ctl';
            parent.appendChild(control);
            return control;
          },
        },
      ],
      entryHandlers: [
        {
          getEntry: getEntryDefault('.isv-r'),
          getURL: getURLDefault('.VFACy'),
          createAction: createActionDefault('ub-pc-images-general-action'),
          adjustEntry: entry => {
            entry.querySelector<HTMLElement>('.VFACy')!.style.verticalAlign = 'bottom';
          },
        },
        {
          getEntry: getEntryDefault('.rg_bx'),
          getURL: entry => {
            const div = entry.querySelector('.rg_meta');
            if (!div) {
              return null;
            }
            return /"ru":"([^"]+)"/.exec(div.textContent!)?.[1] ?? null;
          },
          createAction: createActionDefault('ub-pc-images-general-action'),
        },
      ],
    },
    // News
    nws: {
      controlHandlers: [
        {
          createControl: createControlDefault(
            'ub-pc-news-control',
            '#result-stats, #mBMHK, #resultStats',
          ),
        },
      ],
      entryHandlers: [
        {
          getEntry: getEntryDefault('.bkWMgd'),
          getURL: getURLDefault('.dbsr > a'),
          createAction: createActionDefault('ub-pc-news-general-action', '.pDavDe'),
        },
        {
          getEntry: getEntryDefault('.gG0TJc'),
          getURL: getURLDefault('.l'),
          createAction: createActionDefault('ub-pc-news-general-action-japanese', '.slp'),
          adjustEntry: entry => {
            const previousSibling = entry.previousElementSibling;
            if (
              !previousSibling ||
              !previousSibling.matches('.top') ||
              previousSibling.querySelector('.Y6GIfb')
            ) {
              return;
            }
            entry.insertBefore(previousSibling, entry.firstChild);
          },
        },
        {
          getEntry: getEntryDefault('.YiHbdc, .ErI7Gd'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-news-general-action-japanese'),
          adjustEntry: entry => {
            const viewAll = entry.querySelector('.cWEW3c');
            if (!viewAll) {
              return;
            }
            const parent = entry.parentElement!;
            const nextSibling = entry.nextElementSibling;
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
          getURL: getURLDefault(),
          createAction: createActionDefault('ub-pc-news-image-action-japanese'),
        },
      ],
      containerHandlers: [
        {
          getContainer: getContainerDefault('.autopagerize_page_info + .bkWMgd'),
          getAddedElements: getAddedElementsDefault('.gG0TJc, .YiHbdc, .ErI7Gd, .top'),
        },
      ],
    },
    // Videos
    vid: {
      controlHandlers: [
        {
          createControl: createControlDefault(
            'ub-pc-videos-control',
            '#result-stats, #mBMHK, #resultStats',
          ),
        },
      ],
      entryHandlers: [
        {
          getEntry: getEntryDefault('.g'),
          getURL: getURLDefault('a'),
          createAction: createActionDefault('ub-pc-videos-general-action', '.r'),
        },
      ],
      containerHandlers: [
        {
          getContainer: getContainerDefault('.autopagerize_page_info + .bkWMgd'),
          getAddedElements: getAddedElementsDefault('.g'),
        },
      ],
    },
  };
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
          getEntry: getEntryDefault('.xpd'),
          getURL: getURLFromQuery(':scope > .kCrYT > a'),
          createAction: createActionDefault('ub-mobile-all-general-action'),
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
          getURL: getURLFromQuery(),
          createAction: createActionDefault('ub-mobile-all-latest-action'),
        },
        // Top Story, Twitter Search
        {
          getEntry: addedElement => {
            if (
              !addedElement.matches('.BVG0Nb') ||
              // Twitter
              addedElement.querySelector(':scope > div > div > .RWuggc:first-child')
            ) {
              return null;
            }
            return addedElement;
          },
          getURL: getURLFromQuery(),
          createAction: createActionDefault('ub-mobile-all-top-story-action'),
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
          createAction: createActionDefault('ub-mobile-all-twitter-action'),
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
          getEntry: getEntryDefault('.xpd'),
          getURL: getURLDefault('.kCrYT > a'),
          createAction: createActionDefault('ub-mobile-books-general-action'),
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
          getEntry: getEntryDefault('.islrtb'),
          getURL: getURLFromQuery('.iKjWAf'),
          createAction: createActionDefault('ub-mobile-images-general-action'),
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
          getEntry: getEntryDefault('.xpd'),
          getURL: getURLFromQuery('.kCrYT > a'),
          createAction: createActionDefault('ub-mobile-news-general-action'),
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
          getEntry: getEntryDefault('.xpd'),
          getURL: getURLFromQuery('.kCrYT > a'),
          createAction: createActionDefault('ub-mobile-videos-general-action'),
        },
      ],
    },
  };
  // #endregion Mobile
}
window.ubContentHandlers = tbmToContentHandlers[tbm] ?? null;

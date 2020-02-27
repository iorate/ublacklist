import mobile from 'is-mobile';
import {
  ContentHandlers,
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

function createControlBefore(
  nextSiblingSelector: string,
  className: string,
): () => HTMLElement | null {
  return () => {
    const nextSibling = document.querySelector(nextSiblingSelector);
    if (!nextSibling) {
      return null;
    }
    const control = document.createElement('div');
    control.className = className;
    nextSibling.parentElement!.insertBefore(control, nextSibling);
    return control;
  };
}

const tbm = new URL(window.location.href).searchParams.get('tbm') ?? '';
const tbmToContentHandlers: Record<string, ContentHandlers> = !mobile({ tablet: true })
  ? // #region PC
    {
      // All
      '': {
        controlHandlers: [
          {
            createControl: createControlDefault(
              '#result-stats, #mBMHK, #resultStats',
              'ub-pc-all-control',
            ),
          },
        ],
        entryHandlers: [
          // General, Web Result
          {
            getEntries: getEntriesDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.eFM0qc', 'ub-pc-all-general-action'),
          },
          {
            getEntries: getEntriesDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.yWc32e', 'ub-pc-all-general-action'),
          },
          {
            getEntries: getEntriesDefault('.srg > .g, .bkWMgd > .g:not(.mnr-c):not(.knavi)'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('', 'ub-pc-all-general-action-fallback'),
          },
          // Featured Snippet
          {
            getEntries: getEntriesDefault(
              '.bkWMgd > .g > .kp-blk > .xpdopen > .ifM9O > div > .g',
              5,
            ),
            getURL: getURLDefault('.r > a'),
            createAction: createActionDefault('.eFM0qc', 'ub-pc-all-general-action'),
          },
          {
            getEntries: getEntriesDefault('.bkWMgd > .g.mnr-c'),
            getURL: getURLDefault('.r > a'),
            createAction: createActionDefault('.yWc32e', 'ub-pc-all-general-action'),
          },
          // Latest, Top Story
          {
            getEntries: getEntriesDefault('.So9e7d:nth-child(-n+3) > .ttfMne > .Pd7qJe', 2),
            getURL: getURLDefault('.VlJC0'),
            createAction: createActionDefault('.ttfMne', 'ub-pc-all-latest-action'),
          },
          {
            getEntries: getEntriesDefault('.So9e7d:nth-child(n+4) > .ttfMne', 1),
            getURL: getURLDefault('.VlJC0'),
            createAction: createActionDefault('.ttfMne', 'ub-pc-all-latest-action'),
          },
          // Recipe
          {
            getEntries: getEntriesDefault('.YwonT'),
            getURL: getURLDefault('.a-no-hover-decoration'),
            createAction: createActionDefault('.a-no-hover-decoration', 'ub-pc-all-recipe-action'),
          },
          {
            getEntries: addedElement => {
              return addedElement.matches('.yl > div')
                ? Array.from<HTMLElement>(addedElement.querySelectorAll('.YwonT'))
                : [];
            },
            getURL: getURLDefault('.a-no-hover-decoration'),
            createAction: createActionDefault('.a-no-hover-decoration', 'ub-pc-all-recipe-action'),
          },
          // Top Story
          {
            getEntries: getEntriesDefault(
              'div > div > div > lazy-load-item > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b',
              8,
            ),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.tYlW7b', 'ub-pc-all-top-story-action'),
          },
          {
            getEntries: getEntriesDefault('div > div > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b', 6),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.tYlW7b', 'ub-pc-all-top-story-action'),
          },
          // Twitter
          {
            getEntries: getEntriesDefault('.bkWMgd > div > .g'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.qdrjAc', 'ub-pc-all-twitter-action'),
          },
          // Twitter Search
          {
            getEntries: getEntriesDefault('.bkWMgd > div > .g'),
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
            getEntries: getEntriesDefault('.bkWMgd > div > .g'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault(
              '.Dwsemf',
              'ub-pc-all-twitter-search-action-previous',
            ),
          },
          // Video
          {
            getEntries: getEntriesDefault('.P94G9b > .ZTH1s', 1),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.ZTH1s', 'ub-pc-all-video-action'),
          },
        ],
        pageHandlers: [
          {
            getAddedElements: getAddedElementsDefault('.autopagerize_page_info + .bkWMgd', '.g'),
          },
        ],
      },
      // Books
      bks: {
        controlHandlers: [
          {
            createControl: createControlDefault(
              '#result-stats, #mBMHK, #resultStats',
              'ub-pc-all-control',
            ),
          },
        ],
        entryHandlers: [
          {
            getEntries: getEntriesDefault('.Yr5TG'),
            getURL: getURLDefault('.bHexk > a'),
            createAction: createActionDefault('.eFM0qc', 'ub-pc-books-general-action'),
          },
          {
            getEntries: getEntriesDefault('.g'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.eFM0qc', 'ub-pc-books-general-action'),
          },
        ],
        pageHandlers: [
          {
            getAddedElements: getAddedElementsDefault(
              '.autopagerize_page_info + .bkWMgd',
              '.Yr5TG, .g'
            ),
          },
        ],
      },
      // Images
      isch: {
        controlHandlers: [
          {
            createControl: createControlBefore('.ymoOte', 'ub-pc-images-control'),
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
            getEntries: getEntriesDefault('.isv-r'),
            getURL: getURLDefault('.VFACy'),
            createAction: createActionDefault('', 'ub-pc-images-general-action'),
            adjustEntry: entry => {
              entry.querySelector<HTMLElement>('.VFACy')!.style.verticalAlign = 'bottom';
            },
          },
          {
            getEntries: getEntriesDefault('.rg_bx'),
            getURL: entry => {
              const div = entry.querySelector('.rg_meta');
              if (!div) {
                return null;
              }
              return /"ru":"([^"]+)"/.exec(div.textContent!)?.[1] ?? null;
            },
            createAction: createActionDefault('', 'ub-pc-images-general-action'),
          },
        ],
      },
      // News
      nws: {
        controlHandlers: [
          {
            createControl: createControlDefault(
              '#result-stats, #mBMHK, #resultStats',
              'ub-pc-all-control',
            ),
          },
        ],
        entryHandlers: [
          {
            getEntries: getEntriesDefault('.nChh6e'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.pDavDe', 'ub-pc-news-general-action'),
          },
          {
            getEntries: getEntriesDefault('.gG0TJc'),
            getURL: getURLDefault('.l'),
            createAction: createActionDefault('.slp', 'ub-pc-news-general-action-japanese'),
            adjustEntry: entry => {
              const image = entry.previousElementSibling;
              if (image && !image.querySelector('.Y6GIfb')) {
                entry.insertBefore(image, entry.firstChild);
              }
            },
          },
          {
            getEntries: getEntriesDefault('.YiHbdc, .ErI7Gd'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('', 'ub-pc-news-general-action-japanese'),
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
            getEntries: addedElement => {
              return addedElement.matches('.top') && addedElement.querySelector('.Y6GIfb')
                ? [addedElement]
                : [];
            },
            getURL: getURLDefault(''),
            createAction: createActionDefault('', 'ub-pc-news-image-action-japanese'),
          },
        ],
        pageHandlers: [
          {
            getAddedElements: getAddedElementsDefault(
              '.autopagerize_page_info + .bkWMgd',
              '.nChh6e, .gG0TJc, .YiHbdc, .ErI7Gd, .top',
            ),
          },
        ],
      },
      // Videos
      vid: {
        controlHandlers: [
          {
            createControl: createControlDefault(
              '#result-stats, #mBMHK, #resultStats',
              'ub-pc-all-control',
            ),
          },
        ],
        entryHandlers: [
          {
            getEntries: getEntriesDefault('.g'),
            getURL: getURLDefault('a'),
            createAction: createActionDefault('.r', 'ub-pc-videos-general-action'),
          },
        ],
        pageHandlers: [
          {
            getAddedElements: getAddedElementsDefault('.autopagerize_page_info + .bkWMgd', '.g'),
          },
        ],
      },
    }
  : // #endreion PC

    // #region Mobile
    {
      // All
      '': {
        controlHandlers: [
          {
            createControl: createControlBefore('#main > div:nth-child(4)', 'ub-mobile-all-control'),
          },
        ],
        entryHandlers: [
          // General, Featured Snippet, Twitter, Video
          {
            getEntries: getEntriesDefault('.xpd'),
            getURL: getURLFromQuery('> div > a'),
            createAction: createActionDefault('', 'ub-mobile-all-general-action'),
          },
          // Latest
          {
            getEntries: addedElement => {
              if (!addedElement.matches('.BVG0Nb')) {
                return [];
              }
              if (!addedElement.querySelector('.S7Jdze:last-child')) {
                return [];
              }
              return [addedElement];
            },
            getURL: getURLFromQuery(''),
            createAction: createActionDefault('', 'ub-mobile-all-latest-action'),
          },
          // Top Story, Twitter Search
          {
            getEntries: addedElement => {
              if (!addedElement.matches('.BVG0Nb')) {
                return [];
              }
              if (addedElement.querySelector(':scope > div > div > .RWuggc:first-child')) {
                // Twitter
                return [];
              }
              return [addedElement];
            },
            getURL: getURLFromQuery(''),
            createAction: createActionDefault('', 'ub-mobile-all-top-story-action'),
          },
        ],
      },
      // Books
      bks: {
        controlHandlers: [
          {
            createControl: createControlBefore(
              '#main > div:nth-child(4)',
              'ub-mobile-books-control',
            ),
          },
        ],
        entryHandlers: [
          {
            getEntries: getEntriesDefault('.xpd'),
            getURL: getURLDefault('.kCrYT > a'),
            createAction: createActionDefault('', 'ub-mobile-books-general-action'),
          },
        ],
      },
      // Images
      isch: {
        controlHandlers: [
          {
            createControl: createControlBefore('.dmFHw', 'ub-mobile-images-control'),
          },
        ],
        entryHandlers: [
          {
            getEntries: getEntriesDefault('.islrtb'),
            getURL: getURLFromQuery('.iKjWAf'),
            createAction: createActionDefault('', 'ub-mobile-images-general-action'),
          },
        ],
      },
      // News
      nws: {
        controlHandlers: [
          {
            createControl: createControlBefore(
              '#main > div:nth-child(4)',
              'ub-mobile-news-control',
            ),
          },
        ],
        entryHandlers: [
          {
            getEntries: getEntriesDefault('.xpd'),
            getURL: getURLFromQuery('.kCrYT > a'),
            createAction: createActionDefault('', 'ub-mobile-news-general-action'),
          },
        ],
      },
      // Videos
      vid: {
        controlHandlers: [
          {
            createControl: createControlBefore(
              '#main > div:nth-child(4)',
              'ub-mobile-videos-control',
            ),
          },
        ],
        entryHandlers: [
          {
            getEntries: getEntriesDefault('.xpd'),
            getURL: getURLFromQuery('.kCrYT > a'),
            createAction: createActionDefault('', 'ub-mobile-videos-general-action'),
          },
        ],
      },
    };
// #endregion Mobile
window.ubContentHandlers = tbmToContentHandlers[tbm] ?? null;

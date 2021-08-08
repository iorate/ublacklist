import mobile from 'is-mobile';
import { CSSAttribute, css, glob } from '../styles';
import { SerpHandler } from '../types';
import { handleSerp, insertElement } from './helpers';

// #region desktop
const desktopGlobalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5))',
  },
  '.ub-button': {
    color: 'var(--ub-link-color, rgb(26, 13, 171))',
  },
  '.ub-button:hover': {
    textDecoration: 'underline',
  },
};

const desktopInlineActionStyle: CSSAttribute = {
  display: 'inline-block',
  width: 0,
};

const desktopRegularActionStyle: CSSAttribute = {
  ...desktopInlineActionStyle,
  fontSize: '14px',
  marginLeft: '4px',
  '.fl + &': {
    marginLeft: '6px',
  },
  'span:not([class]) + &': {
    marginLeft: 0,
  },
};

const desktopAboutThisResultActionStyle: CSSAttribute = {
  ...desktopInlineActionStyle,
  fontSize: '14px',
  left: '52px',
  position: 'relative',
  visibility: 'visible',
};

const desktopNewsActionStyle: CSSAttribute = {
  ...desktopInlineActionStyle,
  fontSize: '12px',
  marginLeft: '6px',
};

const desktopSerpHandlers: Record<string, SerpHandler> = {
  // All
  '': handleSerp({
    globalStyle: {
      ...desktopGlobalStyle,
      ':is([data-ub-blocked], [data-ub-highlight]) g-inner-card': {
        backgroundColor: 'transparent !important',
      },
    },
    targets:
      '#result-stats, #botabar, .IsZvec, .g, .kno-fb-ctx, .related-question-pair, F4CzCf, .YwonT, .tYlW7b, .eejeod, .VibNM, .dbsr, .F9rcV',
    controlHandlers: [
      {
        target: '#result-stats',
      },
      {
        target: '#botabar',
        position: 'afterend',
        style: {
          color: 'rgb(112, 117, 122)',
          display: 'block',
          margin: '-24px 0 24px 180px',
        },
      },
      {
        target: '.vI9alf',
        position: 'afterend',
        style: {
          color: 'rgb(112, 117, 122)',
          display: 'block',
          margin: '0 0 16px 180px',
        },
      },
    ],
    entryHandlers: [
      // Regular, Web Result
      {
        target: '.IsZvec',
        level: target => {
          const inner_g = target.closest<HTMLElement>('.g');
          if (!inner_g) {
            return null;
          }
          const outer_g = inner_g.parentElement?.closest<HTMLElement>('.g');
          if (!outer_g) {
            return inner_g;
          }
          if (outer_g.matches('.g-blk')) {
            // Featured Snippet, People Also Ask
            return null;
          } else {
            // Web Result with Sitelinks
            return outer_g;
          }
        },
        url: 'a',
        title: 'h3',
        actionTarget: root =>
          root.querySelector<HTMLElement>('.csDOgf') ||
          root.querySelector<HTMLElement>('.eFM0qc') ||
          root,
        actionPosition: target =>
          insertElement('span', target, target.matches('.csDOgf') ? 'afterend' : 'beforeend'),
        actionStyle: actionRoot => {
          actionRoot.className = css(
            actionRoot.matches('.csDOgf + *')
              ? desktopAboutThisResultActionStyle
              : actionRoot.matches('.eFM0qc > *')
              ? desktopRegularActionStyle
              : {
                  fontSize: '14px',
                  marginTop: '4px',
                },
          );
        },
      },
      // Featured Snippet (About this result)
      {
        target: '.g > .kp-blk > .xpdopen > .ifM9O > div > .g',
        level: 5,
        url: '.yuRUbf > a',
        title: 'h3',
        actionTarget: '.csDOgf',
        actionPosition: 'afterend',
        actionStyle: desktopAboutThisResultActionStyle,
      },
      // Featured Snippet
      {
        target: '.g > .kp-blk > .xpdopen > .ifM9O > div > .g',
        level: 5,
        url: '.yuRUbf > a',
        title: 'h3',
        actionTarget: '.eFM0qc',
        actionStyle: desktopRegularActionStyle,
      },
      // Latest, Top Story (Horizontal)
      {
        target: '.JJZKK .kno-fb-ctx',
        level: '.JJZKK',
        url: 'a',
        title: '[role="heading"][aria-level="4"]',
        actionTarget: '.kno-fb-ctx',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          margin: '-10px 0 10px',
          padding: '0 16px',
          position: 'relative',
          zIndex: 1,
        },
      },
      // People Also Ask
      {
        target: '.related-question-pair, .related-question-pair .VWE0hc',
        level: '.related-question-pair',
        url: '.yuRUbf > a',
        title: root => root.querySelector('h3')?.textContent ?? null,
        actionTarget: '.eFM0qc',
        actionStyle: {
          ...desktopRegularActionStyle,
          '& > .ub-button': {
            display: 'inline-block',
            overflowY: 'hidden',
          },
        },
      },
      // Quote in the News
      {
        target: '.UaDxmd > .F4CzCf',
        level: 1,
        url: '.YVkwvd',
        title: '.YVkwvd > div',
        actionTarget: '.FF4Vu',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          lineHeight: '20px',
        },
      },
      // Recipe
      {
        target: '.YwonT',
        url: '.a-no-hover-decoration',
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.a-no-hover-decoration',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
        },
      },
      // Top Story (Vertical)
      {
        target: 'div > div > div > lazy-load-item > .dbsr > a > .P5BnJb > .Od9uAe > .tYlW7b',
        level: 8,
        url: 'a',
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.tYlW7b',
        actionStyle: {
          ...desktopInlineActionStyle,
          fontSize: '14px',
        },
      },
      {
        target: 'div > div > .dbsr > a > div > div > .tYlW7b',
        level: 6,
        url: 'a',
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.tYlW7b',
        actionStyle: {
          ...desktopInlineActionStyle,
          fontSize: '14px',
        },
      },
      // Twitter, Twitter Search
      {
        target: '.eejeod, .g',
        url: 'g-link > a',
        title: 'a > h3',
        actionTarget: root =>
          root.querySelector<HTMLElement>('.oERM6') || root.querySelector<HTMLElement>('.ellip'),
        actionPosition: target =>
          insertElement('span', target, target.matches('.oERM6') ? 'afterend' : 'beforeend'),
        actionStyle: actionRoot => {
          actionRoot.className = css(
            actionRoot.matches('.oERM6 + *')
              ? desktopAboutThisResultActionStyle
              : desktopRegularActionStyle,
          );
        },
      },
      // Video
      {
        target: '.VibNM',
        url: '.WpKAof',
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.ocUPSd',
        actionStyle: desktopRegularActionStyle,
      },
      // News (COVID-19)
      {
        target: 'div > .XBBQi + .dbsr, div > .AxkxJb + .dbsr',
        level: 1,
        url: '.dbsr > a',
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.XTjFC',
        actionStyle: desktopNewsActionStyle,
      },
      {
        target: 'div > .nChh6e > div > div > div:not(.XBBQi):not(.AxkxJb) + .dbsr',
        level: 4,
        url: '.dbsr > a',
        title: '[role="heading"][aria-level="2"]',
        actionTarget: '.XTjFC',
        actionStyle: desktopNewsActionStyle,
      },
      {
        target: '.nChh6e > div > .dbsr',
        level: 2,
        url: '.dbsr > a',
        title: '[role="heading"][aria-level="2"]',
        actionTarget: '.XTjFC',
        actionStyle: desktopNewsActionStyle,
      },
    ],
    pagerHandlers: [
      // People Also Ask
      {
        target: '.related-question-pair',
        innerTargets: '.g',
      },
      // Recipe, Regular (COVID-19), Web Result (COVID-19), ...
      {
        target: '.yl > div',
        innerTargets: '.YwonT, .IsZvec, .kno-fb-ctx, .dbsr, .F9rcV, .tYlW7b, .VibNM',
      },
      // AutoPagerize
      {
        target: '.autopagerize_page_info ~ .g, .autopagerize_page_info ~ .hlcw0c',
        innerTargets: '.IsZvec',
      },
    ],
  }),
  // Books
  bks: handleSerp({
    globalStyle: desktopGlobalStyle,
    targets: '#result-stats, .Yr5TG',
    controlHandlers: [
      {
        target: '#result-stats',
      },
    ],
    entryHandlers: [
      {
        target: '.Yr5TG',
        url: '.bHexk > a',
        title: 'h3',
        actionTarget: '.eFM0qc',
        actionStyle: desktopRegularActionStyle,
      },
    ],
  }),
  // Images
  isch: handleSerp({
    globalStyle: desktopGlobalStyle,
    targets: '.cEPPT, .isv-r, .VFACy',
    controlHandlers: [
      {
        target: '.cEPPT',
        position: 'afterend',
        style: {
          color: '#70757a',
          display: 'block',
          padding: '0 0 11px 165px',
        },
      },
    ],
    entryHandlers: [
      {
        target: '.isv-r, .isv-r > .VFACy',
        level: '.isv-r',
        url: '.VFACy',
        title: root => {
          const a = root.querySelector<HTMLElement>('.VFACy');
          return a?.firstChild?.textContent ?? null;
        },
        actionTarget: '',
        actionStyle: actionRoot => {
          const style: CSSAttribute = {
            display: 'block',
            fontSize: '11px',
            lineHeight: '16px',
            padding: '0 4px',
          };
          if (actionRoot.matches('[jsname="BWRNE"] *')) {
            // Related images
            style['& > .ub-button'] = {
              color: '#609beb',
            };
          } else {
            style['[data-ub-blocked="visible"] &'] = {
              backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5))',
            };
          }
          actionRoot.className = css(style);
        },
      },
    ],
    pagerHandlers: [
      // Related images
      {
        target: '[jsname="BWRNE"]',
        innerTargets: '.isv-r',
      },
    ],
  }),
  // News
  nws: handleSerp({
    globalStyle: desktopGlobalStyle,
    targets: '#result-stats, .dbsr, .F9rcV',
    controlHandlers: [
      {
        target: '#result-stats',
      },
    ],
    entryHandlers: [
      // Regular
      {
        target: 'div > .XBBQi + .dbsr, div > .AxkxJb + .dbsr',
        level: 1,
        url: '.dbsr > a',
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.XTjFC',
        actionStyle: desktopNewsActionStyle,
      },
      {
        target: 'div > .nChh6e > div > div > div:not(.XBBQi):not(.AxkxJb) + .dbsr',
        level: 4,
        url: '.dbsr > a',
        title: '[role="heading"][aria-level="2"]',
        actionTarget: '.XTjFC',
        actionStyle: desktopNewsActionStyle,
      },
      {
        target: '.nChh6e > div > .dbsr',
        level: 2,
        url: '.dbsr > a',
        title: '[role="heading"][aria-level="2"]',
        actionTarget: '.XTjFC',
        actionStyle: desktopNewsActionStyle,
      },
      // People Also Search For
      {
        target: '.F9rcV',
        url: '.Tsx23b',
        title: '.I1HL6b',
        actionTarget: '.Tsx23b',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          margin: '-12px 0 12px',
          padding: '0 16px',
        },
      },
    ],
    pagerHandlers: [
      // AutoPagerize
      {
        target: '.autopagerize_page_info ~ div',
        innerTargets: '.dbsr',
      },
    ],
  }),
  // Videos
  vid: handleSerp({
    globalStyle: desktopGlobalStyle,
    targets: '#result-stats, .IsZvec',
    controlHandlers: [
      {
        target: '#result-stats',
      },
    ],
    entryHandlers: [
      {
        target: '.g .IsZvec',
        level: '.g',
        url: '.yuRUbf > a',
        title: 'h3',
        actionTarget: '.eFM0qc',
        actionStyle: desktopRegularActionStyle,
      },
    ],
    pagerHandlers: [
      // AutoPagerize
      {
        target: '.autopagerize_page_info ~ .g',
        innerTargets: '.IsZvec',
      },
    ],
  }),
};

let desktopDarkTheme = false;

function detectDesktopDarkTheme(): void {
  if (desktopDarkTheme || !document.body) {
    return;
  }
  const backgroundColor = window.getComputedStyle(document.body).backgroundColor;
  // Should we parse the color value?
  if (backgroundColor === 'rgb(32, 33, 36)') {
    desktopDarkTheme = true;
    glob({
      '.ub-button': {
        color: 'var(--ub-link-color, rgb(138, 180, 248))',
      },
    });
  }
}

function getDesktopSerpHandler(tbm: string): SerpHandler | null {
  if (!desktopSerpHandlers[tbm]) {
    return null;
  }
  const { onSerpStart, onSerpHead, onSerpElement } = desktopSerpHandlers[tbm];
  return {
    onSerpStart,
    onSerpHead: () => {
      const result = onSerpHead();
      detectDesktopDarkTheme();
      return result;
    },
    onSerpElement: element => {
      const result = onSerpElement(element);
      if (
        element instanceof HTMLLinkElement ||
        element instanceof HTMLStyleElement ||
        element === document.body
      ) {
        detectDesktopDarkTheme();
      }
      return result;
    },
    getDialogTheme: () => (desktopDarkTheme ? 'dark' : 'light'),
  };
}

// #endregion desktop

// #region mobile
function getURLFromQuery(selector: string): (root: HTMLElement) => string | null {
  return root => {
    const a = selector ? root.querySelector(selector) : root;
    if (!(a instanceof HTMLAnchorElement)) {
      return null;
    }
    const url = a.href;
    if (!url) {
      return null;
    }
    const u = new URL(url);
    return u.origin === window.location.origin
      ? u.pathname === '/url'
        ? u.searchParams.get('q')
        : u.pathname === '/imgres' || u.pathname === '/search'
        ? null
        : url
      : url;
  };
}

const mobileGlobalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
  },
  '.ub-button': {
    color: 'var(--ub-link-color, rgb(25, 103, 210))',
  },
};

const mobileColoredControlStyle: CSSAttribute = {
  color: 'rgba(0, 0, 0, 0.54)',
};

const mobileRegularControlStyle: CSSAttribute = {
  ...mobileColoredControlStyle,
  borderRadius: '8px',
  boxShadow: '0 1px 6px rgba(32, 33, 36, 0.28)',
  display: 'block',
  marginBottom: '10px',
  padding: '11px 16px',
};

const mobileImageControlStyle: CSSAttribute = {
  ...mobileColoredControlStyle,
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 1px 6px rgba(32, 33, 36, 0.18)',
  display: 'block',
  margin: '0 8px 10px',
  padding: '11px 16px',
};

const mobileRegularActionStyle: CSSAttribute = {
  display: 'block',
  padding: '0 16px 12px',
};

const mobileSerpHandlers: Record<string, SerpHandler> = {
  // All
  '': handleSerp({
    globalStyle: {
      ...mobileGlobalStyle,
      '[data-ub-blocked="visible"] .ZINbbc': {
        backgroundColor: 'transparent !important',
      },
    },
    targets: '#main > div, .xpd, .BVG0Nb, .qxDOhb > div, .X7NTVe',
    controlHandlers: [
      {
        target: '#main > div:nth-child(4)',
        position: 'beforebegin',
        style: mobileRegularControlStyle,
      },
    ],
    entryHandlers: [
      // Regular, Featured Snippet, Video
      {
        target: '.xpd',
        url: getURLFromQuery(':scope > .kCrYT > a'),
        title: '.vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
      // Latest, Top Story (Horizontal), Twitter Search
      {
        target: '.BVG0Nb',
        level: target => (target.closest('.xpd')?.querySelector('.AzGoi') ? null : target),
        url: getURLFromQuery(''),
        title: '.s3v9rd, .vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
      // People Also Ask
      {
        target: '.xpc > .qxDOhb > div',
        level: 2,
        url: getURLFromQuery('.kCrYT > a'),
        title: '.vvjwJb',
        actionTarget: '.xpd',
        actionStyle: mobileRegularActionStyle,
      },
      // Top Story (Vertical)
      {
        target: '.X7NTVe',
        url: getURLFromQuery('.tHmfQe:last-child'), // `:last-child` avoids "Authorized vaccines"
        title: '.deIvCb',
        actionTarget: '.tHmfQe',
        actionStyle: {
          display: 'block',
          paddingTop: '12px',
        },
      },
      // Twitter
      {
        target: '.xpd',
        level: target =>
          target.querySelector(':scope > div:first-child > a > .kCrYT') ? target : null,
        url: getURLFromQuery('a'),
        title: '.vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
    ],
  }),
  // Books
  bks: handleSerp({
    globalStyle: mobileGlobalStyle,
    targets: '#main > div, .xpd',
    controlHandlers: [
      {
        target: '#main > div:nth-child(4)',
        position: 'beforebegin',
        style: mobileRegularControlStyle,
      },
    ],
    entryHandlers: [
      {
        target: '.xpd',
        url: '.kCrYT > a',
        title: '.vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
    ],
  }),
  // Images
  isch: handleSerp({
    globalStyle: {
      ...mobileGlobalStyle,
      '[data-ub-blocked="visible"] .iKjWAf': {
        backgroundColor: 'transparent !important',
      },
    },
    targets: '.dmFHw, #uGbavf, .isv-r',
    controlHandlers: [
      {
        target: '.dmFHw',
        position: 'beforebegin',
        style: mobileImageControlStyle,
      },
      {
        target: '#uGbavf',
        position: target =>
          document.querySelector('.dmFHw') ? null : insertElement('span', target, 'beforebegin'),
        style: mobileImageControlStyle,
      },
    ],
    entryHandlers: [
      {
        target: '.isv-r',
        url: getURLFromQuery('.iKjWAf'),
        title: '.mVDMnf',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '11px',
          lineHeight: '20px',
          margin: '-4px 0 4px',
          padding: '0 4px',
        },
      },
    ],
  }),
  // News
  nws: handleSerp({
    globalStyle: mobileGlobalStyle,
    targets: '#main > div, .xpd',
    controlHandlers: [
      {
        target: '#main > div:nth-child(4)',
        position: 'beforebegin',
        style: mobileRegularControlStyle,
      },
    ],
    entryHandlers: [
      {
        target: '.xpd',
        url: getURLFromQuery('.kCrYT > a'),
        title: '.vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
    ],
  }),
  // Videos
  vid: handleSerp({
    globalStyle: mobileGlobalStyle,
    targets: '#main > div, .xpd',
    controlHandlers: [
      {
        target: '#main > div:nth-child(4)',
        position: 'beforebegin',
        style: mobileRegularControlStyle,
      },
    ],
    entryHandlers: [
      {
        target: '.xpd',
        url: getURLFromQuery('.kCrYT > a'),
        title: '.vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
    ],
  }),
};

function getMobileSerpHandler(tbm: string): SerpHandler | null {
  return mobileSerpHandlers[tbm] || null;
}
// #endregion mobile

export function getSerpHandler(): SerpHandler | null {
  const tbm = new URL(window.location.href).searchParams.get('tbm') ?? '';
  return mobile({ tablet: true }) ? getMobileSerpHandler(tbm) : getDesktopSerpHandler(tbm);
}

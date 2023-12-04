import { CSSAttribute, css } from '../styles';
import { SerpHandler } from '../types';
import { handleSerp, hasDarkBackground, insertElement } from './helpers';

function getURLFromPing(selector: string): (root: HTMLElement) => string | null {
  return root => {
    const a = selector ? root.querySelector(selector) : root;
    if (!(a instanceof HTMLAnchorElement)) {
      return null;
    }
    if (a.ping) {
      try {
        return new URL(a.ping, window.location.href).searchParams.get('url');
      } catch {
        return null;
      }
    }
    const href = a.getAttribute('href');
    if (href) {
      try {
        new URL(href);
        return href;
      } catch {
        return null;
      }
    }
    return null;
  };
}

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

const iOSButtonStyle: CSSAttribute = {
  '& .ub-button': {
    color: 'var(--ub-link-color, #1558d6)',
  },
  '[data-ub-dark="1"] & .ub-button': {
    color: 'var(--ub-link-color, #8ab4f8)',
  },
};

const mobileSerpHandlers: Record<string, SerpHandler> = {
  // All
  '': handleSerp({
    globalStyle: {
      ...mobileGlobalStyle,
      '[data-ub-blocked] .ZINbbc, [data-ub-highlight] .ZINbbc, [data-ub-blocked] .D9l01, [data-ub-highlight] .D9l01':
        {
          backgroundColor: 'transparent !important',
        },
    },
    controlHandlers: [
      {
        target: '#taw',
        position: 'afterbegin',
        style: root => {
          const controlClass = css({
            display: 'block',
            fontSize: '14px',
            padding: '12px 16px',
            ...iOSButtonStyle,
          });
          root.className = `mnr-c ${controlClass}`;
        },
      },
      {
        target: '#main > div:nth-child(4)',
        position: 'beforebegin',
        style: mobileRegularControlStyle,
      },
    ],
    entryHandlers: [
      // Regular (iOS)
      {
        target: '.xpd',
        level: target => {
          if (target.querySelector('.kCrYT')) {
            // Firefox
            return null;
          }
          const webResultWithSiteLinks =
            target.parentElement?.closest<HTMLElement>('.Ww4FFb.g, .mnr-c.g');
          if (webResultWithSiteLinks) {
            return webResultWithSiteLinks;
          }
          if (target.querySelector('.xpd')) {
            return null;
          }
          return target;
        },
        url: getURLFromPing('a'),
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          padding: '0 16px 12px 16px',
          ...iOSButtonStyle,
        },
      },
      // Video (iOS)
      {
        target: '.tRkSqb',
        url: getURLFromPing('a'),
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          marginTop: '12px',
          padding: '0 16px',
          position: 'relative',
          ...iOSButtonStyle,
        },
      },
      // YouTube Channel (iOS)
      {
        target: '.XqIXXe > .mnr-c h3 > a',
        level: '.mnr-c',
        url: getURLFromPing('h3 > a'),
        title: 'h3',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          padding: '0 16px 12px 16px',
          ...iOSButtonStyle,
        },
      },
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
    pagerHandlers: [
      // iOS
      {
        target: '[id^="arc-srp_"] > div',
        innerTargets: '.xpd, .tRkSqb',
      },
      // Results in tabs (iOS)
      {
        target: '.yl > div',
        innerTargets: '.xpd, .tRkSqb',
      },
    ],
  }),
  // Books
  bks: handleSerp({
    globalStyle: mobileGlobalStyle,
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
    controlHandlers: [
      {
        target: '.T1diZc',
        position: 'afterbegin',
        style: root => {
          const controlClass = css({
            display: 'block',
            fontSize: '12px',
            padding: '0 16px',
            '&&&': {
              borderRadius: 0,
            },
            ...iOSButtonStyle,
          });
          root.className = `mnr-c ${controlClass}`;
        },
      },
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
        target: '.isv-r[role="listitem"]',
        url: 'a:not([role="button"])',
        title: 'h2',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          margin: '-4px 0',
          overflow: 'hidden',
          padding: '4px 0',
          position: 'relative',
          ...iOSButtonStyle,
        },
      },
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
    controlHandlers: [
      {
        target: '#taw',
        position: 'afterbegin',
        style: root => {
          const controlClass = css({
            display: 'block',
            fontSize: '12px',
            padding: '12px',
            ...iOSButtonStyle,
          });
          root.className = `mnr-c ${controlClass}`;
        },
      },
      {
        target: '#main > div:nth-child(4)',
        position: 'beforebegin',
        style: mobileRegularControlStyle,
      },
    ],
    entryHandlers: [
      {
        target: '.Ww4FFb, .mnr-c',
        url: getURLFromPing('a'),
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          marginTop: '-8px',
          padding: '0 16px 12px 16px',
          ...iOSButtonStyle,
        },
      },
      {
        target: '.xpd',
        url: getURLFromQuery(':scope > a'),
        title: '.vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
    ],
  }),
  // Videos
  vid: handleSerp({
    globalStyle: {
      '.RDE29e.RDE29e': {
        margin: '12px 12px 20px 16px',
      },
      ...mobileGlobalStyle,
    },
    controlHandlers: [
      {
        target: '#taw',
        position: 'afterbegin',
        style: root => {
          const controlClass = css({
            display: 'block',
            fontSize: '12px',
            padding: '12px',
            ...iOSButtonStyle,
          });
          root.className = `mnr-c ${controlClass}`;
        },
      },
      {
        target: '#main > div:nth-child(4)',
        position: 'beforebegin',
        style: mobileRegularControlStyle,
      },
    ],
    entryHandlers: [
      {
        target: '.mnr-c',
        url: 'a[ping]',
        title: root => root.querySelector('[role="heading"][aria-level="3"]')?.ariaLabel ?? null,
        actionTarget: '.RDE29e',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          lineHeight: '16px',
          padding: '4px 0',
          position: 'absolute',
          top: '100%',
          ...iOSButtonStyle,
        },
      },
      {
        target: '.xpd',
        url: getURLFromQuery('.kCrYT > a'),
        title: '.vvjwJb',
        actionTarget: '',
        actionStyle: mobileRegularActionStyle,
      },
    ],
    pagerHandlers: [
      // iOS
      {
        target: '[id^="arc-srp_"] > div',
        innerTargets: '.mnr-c',
      },
    ],
  }),
};

export function getMobileSerpHandler(tbm: string): SerpHandler | null {
  const serpHandler = mobileSerpHandlers[tbm];
  if (!serpHandler) {
    return null;
  }
  if (tbm === 'isch') {
    const inspectBodyStyle = () => {
      if (!document.body) {
        return;
      }
      if (hasDarkBackground(document.body)) {
        document.documentElement.dataset.ubDark = '1';
      } else {
        delete document.documentElement.dataset.ubDark;
      }
    };
    const observeStyleElement = (styleElement: HTMLStyleElement): void => {
      new MutationObserver(() => inspectBodyStyle()).observe(styleElement, { childList: true });
    };
    return {
      ...serpHandler,
      onSerpStart() {
        inspectBodyStyle();
        const styleElement = document.querySelector<HTMLStyleElement>(
          'style[data-href^="https://www.gstatic.com"]',
        );
        if (styleElement) {
          observeStyleElement(styleElement);
        }
        return serpHandler.onSerpStart();
      },
      onSerpElement(element: HTMLElement) {
        if (
          element instanceof HTMLStyleElement &&
          element.dataset.href?.startsWith('https://www.gstatic.com')
        ) {
          inspectBodyStyle();
          observeStyleElement(element);
        } else if (element === document.body) {
          inspectBodyStyle();
        }
        return serpHandler.onSerpElement(element);
      },
      getDialogTheme() {
        return document.documentElement.dataset.ubDark === '1' ? 'dark' : 'light';
      },
    };
  } else {
    return {
      ...serpHandler,
      onSerpStart() {
        if (document.querySelector('meta[name="color-scheme"]')) {
          document.documentElement.dataset.ubDark = '1';
        }
        return serpHandler.onSerpStart();
      },
      onSerpElement(element) {
        if (element.matches('meta[name="color-scheme"]')) {
          document.documentElement.dataset.ubDark = '1';
        }
        return serpHandler.onSerpElement(element);
      },
      getDialogTheme() {
        return document.documentElement.dataset.ubDark === '1' ? 'dark' : 'light';
      },
    };
  }
}

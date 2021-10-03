import { CSSAttribute, css } from '../../styles';
import { SerpHandler } from '../../types';
import { handleSerp, insertElement } from '../helpers';

function getURLFromPing(selector: string): (root: HTMLElement) => string | null {
  return root => {
    const a = selector ? root.querySelector(selector) : root;
    if (!(a instanceof HTMLAnchorElement) || !a.ping) {
      return null;
    }
    try {
      return new URL(a.ping, window.location.href).searchParams.get('url');
    } catch {
      return null;
    }
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
  color: 'var(--ub-link-color, #1558d6)',
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
    targets: '#taw, #main > div, .xpd, .BVG0Nb, .qxDOhb > div, .X7NTVe',
    controlHandlers: [
      {
        target: '#taw',
        position: 'afterbegin',
        style: root => {
          const controlClass = css({
            display: 'block',
            fontSize: '14px',
            padding: '12px 16px',
            '& > .ub-button': iOSButtonStyle,
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
        target: '.mnr-c.xpd',
        level: target => target.parentElement?.closest<HTMLElement>('.mnr-c') || target,
        url: getURLFromPing('a'),
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          marginTop: '-4px',
          padding: '0 16px 12px 16px',
          '& > .ub-button': iOSButtonStyle,
        },
      },
      // Video (iOS)
      {
        target: '.mnr-c.PHap3c',
        url: getURLFromPing('.C8nzq'),
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '14px',
          marginTop: '12px',
          padding: '0 16px',
          '& > .ub-button': iOSButtonStyle,
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
        innerTargets: '.mnr-c',
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
    targets: '.T1diZc, .dmFHw, .isv-r, .VFACy, #uGbavf',
    controlHandlers: [
      {
        target: '.T1diZc',
        position: 'afterbegin',
        style: {
          backgroundColor: '#fff',
          color: '#4d5156',
          display: 'block',
          fontSize: '12px',
          marginBottom: '19px',
          padding: '4px 12px 12px',
          '& > .ub-button': iOSButtonStyle,
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
        target: '.isv-r, .isv-r > .VFACy',
        level: '.isv-r',
        url: '.VFACy',
        title: root => {
          const a = root.querySelector<HTMLElement>('.VFACy');
          return a?.firstChild?.textContent ?? null;
        },
        actionTarget: '',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          margin: '-8px 0 8px',
          overflow: 'hidden',
          padding: '0 4px',
          position: 'relative',
          '& > .ub-button': iOSButtonStyle,
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
    targets: '#taw, #main > div, .S1FAPd, .xpd',
    controlHandlers: [
      {
        target: '#taw',
        position: 'afterbegin',
        style: root => {
          const controlClass = css({
            display: 'block',
            fontSize: '12px',
            padding: '12px',
            '& > .ub-button': iOSButtonStyle,
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
        target: '.S1FAPd',
        level: '.WlydOe',
        url: getURLFromPing(''),
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.S1FAPd',
        actionStyle: {
          display: 'inline-block',
          fontSize: '12px',
          marginLeft: '4px',
          width: 0,
          '& > .ub-button': iOSButtonStyle,
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
  }),
  // Videos
  vid: handleSerp({
    globalStyle: {
      '.ucBsPc': {
        height: '108px',
      },
      ...mobileGlobalStyle,
    },
    targets: '#taw, #main > div, video-voyager, .xpd',
    controlHandlers: [
      {
        target: '#taw',
        position: 'afterbegin',
        style: root => {
          const controlClass = css({
            display: 'block',
            fontSize: '12px',
            padding: '12px',
            '& > .ub-button': iOSButtonStyle,
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
        target: 'video-voyager',
        url: 'a',
        title: '.V82bz',
        actionTarget: '.b5ZQcf',
        actionStyle: {
          display: 'block',
          fontSize: '12px',
          marginTop: '4px',
          '& > .ub-button': iOSButtonStyle,
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
        innerTargets: 'video-voyager',
      },
    ],
  }),
};

export function getMobileSerpHandler(tbm: string): SerpHandler | null {
  return mobileSerpHandlers[tbm] || null;
}

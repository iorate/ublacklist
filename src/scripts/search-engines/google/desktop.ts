import { CSSAttribute, css } from '../../styles';
import { SerpHandler } from '../../types';
import { EntryHandler, handleSerp, hasDarkBackground, insertElement } from '../helpers';

const desktopGlobalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5))',
  },
  '.ub-button': {
    color: 'var(--ub-link-color, rgb(26, 13, 171))',
  },
  '[data-ub-dark="1"] .ub-button': {
    color: 'var(--ub-link-color, rgb(138, 180, 248))',
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

const insertActionNextToBreadcrumb: Readonly<
  Pick<EntryHandler, 'actionTarget' | 'actionPosition' | 'actionStyle'>
> = {
  actionTarget: root =>
    root.querySelector<HTMLElement>('.csDOgf') || root.querySelector<HTMLElement>('.eFM0qc'),
  actionPosition: target =>
    insertElement('span', target, target.matches('.csDOgf') ? 'afterend' : 'beforeend'),
  actionStyle: actionRoot => {
    actionRoot.className = css(
      actionRoot.matches('.csDOgf + *')
        ? desktopAboutThisResultActionStyle
        : desktopRegularActionStyle,
    );
  },
};

const desktopSerpHandlers: Record<string, SerpHandler> = {
  // All
  '': handleSerp({
    globalStyle: {
      ...desktopGlobalStyle,
      '[data-ub-blocked] g-inner-card, [data-ub-highlight] g-inner-card, [data-ub-blocked] .kp-blk, [data-ub-highlight] .kp-blk':
        {
          backgroundColor: 'transparent !important',
        },
    },
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
          if (inner_g.matches('.related-question-pair *')) {
            // People Also Ask
            return null;
          }
          const outer_g = inner_g.parentElement?.closest<HTMLElement>('.g');
          if (!outer_g) {
            return inner_g;
          }
          if (outer_g.matches('.g-blk')) {
            // Featured Snippet
            return null;
          }
          if (outer_g.querySelector(':scope > h2')) {
            // Web Result with Sitelinks
            return outer_g;
          }
          return inner_g;
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
      // Featured Snippet
      {
        target: '.g > .kp-blk > .xpdopen > .ifM9O .g',
        level: target => target.parentElement?.closest('.g') ?? null,
        url: 'a',
        title: 'h3',
        ...insertActionNextToBreadcrumb,
      },
      // Latest, Top Story (Horizontal)
      {
        target: '.JJZKK .kno-fb-ctx',
        level: '.JJZKK',
        url: 'a',
        title: '[role="heading"][aria-level="4"]',
        actionTarget: '.S1FAPd',
        actionStyle: {
          ...desktopInlineActionStyle,
          marginLeft: '4px',
        },
      },
      // People Also Ask
      {
        target: '.related-question-pair .g',
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
        target:
          'div > a > div > .iRPxbe > .ZE0LJd > .S1FAPd, div > a > div > .ZJjs0c > .ZE0LJd > .S1FAPd',
        level: 5,
        url: 'a',
        title: '.mCBkyc',
        actionTarget: '.S1FAPd',
        actionStyle: {
          ...desktopInlineActionStyle,
          marginLeft: '4px',
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
        target: '.dXiKIc',
        level: '.g',
        url: 'a',
        title: 'h3',
        ...insertActionNextToBreadcrumb,
      },
      {
        target: '.RzdJxc',
        url: '.X5OiLe',
        title: '.fc9yUc',
        actionTarget: '.hMJ0yc',
        actionStyle: {
          ...desktopInlineActionStyle,
          fontSize: '14px',
          marginLeft: '4px',
        },
      },
      // YouTube Channel
      {
        target: '.mnr-c > .krUaHe',
        level: 1,
        url: 'a',
        title: 'h3',
        ...insertActionNextToBreadcrumb,
      },
      // News (COVID-19)
      {
        target: '.XXW1wb .WlydOe, .ftSUBd .WlydOe',
        level: target => target.closest('.ftSUBd') || target,
        url: root => {
          const a = root.matches('.ftSUBd') ? root.querySelector<HTMLElement>('.WlydOe') : root;
          return a instanceof HTMLAnchorElement ? a.href : null;
        },
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.CEMjEf',
        actionStyle: desktopNewsActionStyle,
      },
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
      // Recipe, Regular (COVID-19), Web Result (COVID-19), ...
      {
        target: '.yl > div',
        innerTargets:
          '.YwonT, .IsZvec, .kno-fb-ctx, .g, .WlydOe, .dbsr, .F9rcV, .tYlW7b, .RzdJxc, .VibNM',
      },
      // AutoPagerize
      {
        target: '.autopagerize_page_info ~ div',
        innerTargets: '.IsZvec, .dXiKIc',
      },
    ],
  }),
  // Books
  bks: handleSerp({
    globalStyle: desktopGlobalStyle,
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
              color: 'var(--ub-link-color, #609beb)',
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
    controlHandlers: [
      {
        target: '#result-stats',
      },
    ],
    entryHandlers: [
      // Regular
      {
        target: '.WlydOe',
        level: target => target.closest('.ftSUBd') || target,
        url: root => {
          const a = root.matches('.ftSUBd') ? root.querySelector<HTMLElement>('.WlydOe') : root;
          return a instanceof HTMLAnchorElement ? a.href : null;
        },
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.CEMjEf',
        actionStyle: desktopNewsActionStyle,
      },
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
        innerTargets: '.WlydOe, .dbsr',
      },
    ],
  }),
  // Videos
  vid: handleSerp({
    globalStyle: desktopGlobalStyle,
    controlHandlers: [
      {
        target: '#result-stats',
      },
    ],
    entryHandlers: [
      {
        target: '.dXiKIc',
        level: '.g',
        url: 'a',
        title: 'h3',
        actionTarget: '.eFM0qc',
        actionStyle: desktopRegularActionStyle,
      },
    ],
    pagerHandlers: [
      // AutoPagerize
      {
        target: '.autopagerize_page_info ~ div',
        innerTargets: '.dXiKIc',
      },
    ],
  }),
};

function updateDarkMode(): void {
  if (!document.body) {
    return;
  }
  if (hasDarkBackground(document.body)) {
    document.documentElement.dataset.ubDark = '1';
  } else {
    delete document.documentElement.dataset.ubDark;
  }
}

export function getDesktopSerpHandler(tbm: string): SerpHandler | null {
  const serpHandler = desktopSerpHandlers[tbm];
  if (!desktopSerpHandlers[tbm]) {
    return null;
  }
  return {
    onSerpStart: () => {
      updateDarkMode();
      return serpHandler.onSerpStart();
    },
    onSerpHead: serpHandler.onSerpHead,
    onSerpElement: element => {
      if (
        (element instanceof HTMLLinkElement && element.relList.contains('stylesheet')) ||
        element instanceof HTMLStyleElement ||
        element === document.body
      ) {
        updateDarkMode();
      }
      return serpHandler.onSerpElement(element);
    },
    getDialogTheme: () => (document.documentElement.dataset.ubDark === '1' ? 'dark' : 'light'),
  };
}

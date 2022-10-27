import { CSSAttribute, css } from '../styles';
import { SerpHandler } from '../types';
import { handleSerp, hasDarkBackground, insertElement } from './helpers';

const desktopGlobalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
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

function insertActionBeforeMenu(target: HTMLElement): HTMLElement | null {
  const menuParent = target.querySelector<HTMLElement>(':scope > span:not([class])');
  if (menuParent?.querySelector('.action-menu')?.querySelector('svg')) {
    return insertElement('span', menuParent, 'beforebegin');
  }
  return insertElement('span', target, 'beforeend');
}

const desktopActionStyle: CSSAttribute = {
  '&::before': {
    content: '" · "',
  },
};

const desktopRegularActionStyle: CSSAttribute = {
  '&::before': {
    content: '" · "',
    padding: '0 2px 0 4px',
  },
  // next to triangle
  '.eFM0qc > span:not([class]) + &::before': {
    content: 'none',
    padding: 0,
  },
  fontSize: '14px',
  lineHeight: 1.3,
  visibility: 'visible',
};

const desktopSerpHandlers: Record<string, SerpHandler> = {
  // All
  '': handleSerp({
    globalStyle: {
      ...desktopGlobalStyle,
      [[
        '.dG2XIf', // Featured Snippet
        'g-inner-card',
      ]
        .flatMap(s => [`[data-ub-blocked] ${s}`, `[data-ub-highlight] ${s}`])
        .join(', ')]: {
        backgroundColor: 'transparent !important',
      },
      // Remove remaining space when hiding nested results
      '.FxLDp:has(> .MYVUIe:only-child [data-ub-blocked="hidden"])': {
        display: 'none',
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
        target: '[data-content-feature="1"], [data-header-feature="0"] + .Z26q7c',
        level: 2,
        url: 'a',
        title: 'h3',
        actionTarget: '.eFM0qc',
        actionPosition: insertActionBeforeMenu,
        actionStyle: desktopRegularActionStyle,
      },
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
        actionTarget: '.eFM0qc',
        actionPosition: insertActionBeforeMenu,
        actionStyle: desktopRegularActionStyle,
      },
      // Featured Snippet
      {
        target: '.g .xpdopen .ifM9O .g',
        level: target => target.parentElement?.closest('.g') ?? null,
        url: '.yuRUbf > a',
        title: 'h3',
        actionTarget: '.eFM0qc',
        actionPosition: insertActionBeforeMenu,
        actionStyle: desktopRegularActionStyle,
      },
      // Latest, Top Story (Horizontal)
      {
        target: '.JJZKK .kno-fb-ctx, .JJZKK .kno-fb-ctx .ZE0LJd, .JJZKK .kno-fb-ctx .S1FAPd',
        level: '.JJZKK',
        url: 'a',
        title: '[role="heading"][aria-level="4"]',
        actionTarget: '.ZE0LJd, .S1FAPd',
        actionStyle: desktopActionStyle,
      },
      // People Also Ask
      {
        target: '.related-question-pair .g',
        level: '.related-question-pair',
        url: '.yuRUbf > a',
        title: root => root.querySelector('h3')?.textContent ?? null,
        actionTarget: '.eFM0qc',
        actionPosition: insertActionBeforeMenu,
        actionStyle: desktopRegularActionStyle,
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
        target: '.yG4QQe .WlydOe .ZE0LJd, .yG4QQe .WlydOe .S1FAPd',
        level: target => {
          if (target.matches('.JJZKK *')) {
            // Latest, Top story (Horizontal)
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return target.closest('.WlydOe')!.parentElement;
        },
        url: '.WlydOe',
        title: '.mCBkyc',
        actionTarget: '.ZE0LJd, .S1FAPd',
        actionStyle: actionRoot => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          actionRoot.parentElement!.style.whiteSpace = 'nowrap';
          actionRoot.className = css(desktopActionStyle);
        },
      },
      // Twitter, Twitter Search
      {
        target: '.eejeod',
        url: 'g-link > a',
        title: 'a > h3',
        actionTarget: root => {
          const aboutThisResult = root.querySelector<HTMLElement>('.ellip > .hzVK5c');
          return aboutThisResult ? aboutThisResult.parentElement : root.querySelector('.ellip');
        },
        actionPosition: target => {
          const aboutThisResult = target.querySelector<HTMLElement>(':scope > .hzVK5c');
          return aboutThisResult
            ? insertElement('span', aboutThisResult, 'beforebegin')
            : insertElement('span', target, 'beforeend');
        },
        actionStyle: actionRoot => {
          actionRoot.className = css(
            actionRoot.matches('.Y3iVZd *')
              ? // With "About this result" and single tweet
                {
                  ...desktopRegularActionStyle,
                  display: 'inline-block',
                  marginTop: '7px',
                }
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
        actionTarget: '.eFM0qc',
        actionPosition: insertActionBeforeMenu,
        actionStyle: desktopRegularActionStyle,
      },
      {
        target: '.RzdJxc .hMJ0yc',
        level: '.RzdJxc',
        url: '.X5OiLe',
        title: '.fc9yUc',
        actionTarget: '.hMJ0yc',
        actionStyle: desktopActionStyle,
      },
      // YouTube and TikTok Channel
      {
        target: '.d3zsgb, .rULfzc',
        level: 1,
        url: 'a',
        title: 'h3',
        actionTarget: '.eFM0qc',
        actionPosition: insertActionBeforeMenu,
        actionStyle: desktopRegularActionStyle,
      },
      // News (COVID-19)
      {
        target:
          '.XXW1wb .WlydOe .ZE0LJd, .XXW1wb .WlydOe .S1FAPd, .ftSUBd .WlydOe .ZE0LJd, .ftSUBd .WlydOe .S1FAPd',
        level: target => target.closest('.ftSUBd') || target.closest('.WlydOe'),
        url: root => {
          const a = root.matches('.ftSUBd') ? root.querySelector<HTMLElement>('.WlydOe') : root;
          return a instanceof HTMLAnchorElement ? a.href : null;
        },
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.ZE0LJd, .S1FAPd',
        actionStyle: desktopActionStyle,
      },
    ],
    pagerHandlers: [
      // People Also Ask
      {
        target: '[jsname="Cpkphb"]',
        innerTargets: '.g',
      },
      // Recipe, Regular (COVID-19), Web Result (COVID-19), ...
      {
        target: '.yl > div',
        innerTargets:
          '.YwonT, [data-content-feature="1"], .IsZvec, .kno-fb-ctx, .ZE0LJd, .S1FAPd, .g, .F9rcV, .hMJ0yc',
      },
      // AutoPagerize
      {
        target: '.autopagerize_page_info ~ div',
        innerTargets: '[data-content-feature="1"], .IsZvec, .dXiKIc',
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
        actionPosition: insertActionBeforeMenu,
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
        target: '.WlydOe .ZE0LJd, .WlydOe .S1FAPd',
        level: target => target.closest('.ftSUBd') || target.closest('.WlydOe'),
        url: root => {
          const a = root.matches('.ftSUBd') ? root.querySelector<HTMLElement>('.WlydOe') : root;
          return a instanceof HTMLAnchorElement ? a.href : null;
        },
        title: '[role="heading"][aria-level="3"]',
        actionTarget: '.ZE0LJd, .S1FAPd',
        actionStyle: desktopActionStyle,
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
        innerTargets: '.ZE0LJd, .S1FAPd',
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
        actionPosition: insertActionBeforeMenu,
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
    ...serpHandler,
    onSerpStart: () => {
      updateDarkMode();
      return serpHandler.onSerpStart();
    },
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

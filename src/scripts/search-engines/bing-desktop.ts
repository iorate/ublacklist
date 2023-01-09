import * as S from 'microstruct';
import { CSSAttribute, css } from '../styles';
import { SerpHandler } from '../types';
import { makeAltURL } from '../utilities';
import { getParentElement, handleSerp } from './helpers';

const globalStyle: CSSAttribute = {
  '[data-ub-blocked="visible"]': {
    backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
  },
  '.ub-button': {
    color: 'var(--ub-link-color, rgb(26, 13, 171))',
  },
  '.ub-button:hover': {
    textDecoration: 'underline',
  },
};

const controlStyle: CSSAttribute = {
  display: 'block',
  fontSize: '14px',
  lineHeight: 2.5,
};

const serpHandlers: Readonly<Record<string, SerpHandler | undefined>> = {
  '/search': handleSerp({
    globalStyle,
    controlHandlers: [
      {
        target: '#b_results',
        position: 'beforebegin',
        style: {
          ...controlStyle,
          marginLeft: '20px',
        },
      },
    ],
    entryHandlers: [
      {
        target: '.b_algo',
        url: root => {
          const url = root.querySelector<HTMLAnchorElement>('h2 > a')?.href;
          if (!url) {
            return null;
          }
          const u = makeAltURL(url);
          if (!u || u.host === 'www.bing.com') {
            // "Open links from search results in a new tab or window" is turned on
            return null;
          }
          return url;
        },
        title: 'h2',
        actionTarget: '.b_attribution',
        actionStyle: {
          display: 'inline-block',
          width: 0,
          'cite + &, a:not(.trgr_icon) + &': {
            marginLeft: '6px',
          },
        },
      },
    ],
  }),
  '/images/search': handleSerp({
    globalStyle: {
      '.ub-button': {
        color: 'var(--ub-link-color, rgb(26, 13, 171))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
    },
    controlHandlers: [
      {
        target: '.dg_b',
        position: 'beforebegin',
        style: {
          ...controlStyle,
          marginLeft: '10px',
        },
      },
    ],
    entryHandlers: [
      {
        target: '.infnmpt > .infsd, .img_info > .lnkw',
        level: '.dgControl_list > li',
        url: root => {
          const m = root.querySelector<HTMLElement>('.iusc')?.getAttribute('m');
          return m != null ? S.parse(m, S.type({ purl: S.string() }))?.purl ?? null : null;
        },
        title: root => {
          const m = root.querySelector<HTMLElement>('.iusc')?.getAttribute('m');
          return m != null ? S.parse(m, S.type({ t: S.string() }))?.t ?? null : null;
        },
        actionTarget: root =>
          root.querySelector<HTMLElement>('.infnmpt') ??
          root.querySelector<HTMLElement>('.img_info'),
        actionStyle: actionRoot => {
          const actionTarget = getParentElement(actionRoot);
          if (actionTarget.matches('.infnmpt')) {
            actionRoot.closest<HTMLElement>('.infopt')?.classList.add(
              css({
                '[data-ub-blocked="visible"] &': {
                  backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
                },
              }),
            );
            actionRoot.className = css({
              display: 'block',
              fontSize: '11px',
              lineHeight: '16px',
              marginTop: '-8px',
              overflow: 'hidden',
              paddingBottom: '8px',
              pointerEvents: 'auto',
              textOverflow: 'ellipsis',
            });
          } else {
            actionRoot.closest<HTMLElement>('.imgpt')?.classList.add(
              css({
                '[data-ub-blocked="visible"] &': {
                  boxShadow: '0 0 0 12px rgba(255, 192, 192, 0.5)',
                },
              }),
            );
            actionTarget.classList.add(
              css({
                height: '49.2px !important',
              }),
            );
            actionRoot.className = css({
              pointerEvents: 'auto',
              '& .ub-button': {
                color: 'var(--ub-link-color, inherit)',
              },
            });
          }
        },
      },
    ],
    pagerHandlers: [
      {
        target: '.dgControl_list, .dgControl_list > li',
        innerTargets: '.infsd, .lnkw',
      },
      {
        target: '#b_content',
        innerTargets: '.dg_b, .infsd, .lnkw',
      },
    ],
  }),
  '/videos/search': handleSerp({
    globalStyle: {
      ...globalStyle,
      '[data-ub-blocked] .mc_vtvc, [data-ub-blocked] .mc_vtvc_meta, [data-ub-highlight] .mc_vtvc, [data-ub-highlight] .mc_vtvc_meta':
        {
          backgroundColor: 'transparent !important',
        },
      '[data-ub-blocked] .mc_vtvc_meta_bg_w img, [data-ub-highlight] .mc_vtvc_meta_bg_w img': {
        visibility: 'hidden',
      },
      '.dg_u': {
        height: '284px !important',
      },
      '.mc_vtvc_meta_w': {
        height: '119px !important',
      },
    },
    controlHandlers: [
      {
        target: '#vm_res',
        position: 'beforebegin',
        style: {
          ...controlStyle,
          marginLeft: '160px',
        },
      },
    ],
    entryHandlers: [
      {
        target: '.dg_u',
        url: root => {
          const vrhm = root.querySelector<HTMLElement>('.vrhdata')?.getAttribute('vrhm');
          return vrhm != null ? S.parse(vrhm, S.type({ murl: S.string() }))?.murl ?? null : null;
        },
        title: '.mc_vtvc_title',
        actionTarget: '.mc_vtvc_meta',
        actionStyle: {
          display: 'block',
        },
      },
    ],
    pagerHandlers: [
      {
        target: '.dg_b',
        innerTargets: '.dg_u',
      },
      {
        target: '#b_content',
        innerTargets: '#vm_res, .dg_u',
      },
    ],
  }),
  '/news/search': handleSerp({
    globalStyle,
    controlHandlers: [
      {
        target: '#contentid',
        position: 'afterbegin',
        style: {
          display: 'block',
          marginBottom: '20px',
        },
      },
    ],
    entryHandlers: [
      {
        target: '.source',
        level: target => {
          const newsCard = target.closest<HTMLElement>('.news-card');
          return newsCard?.querySelector('.generalads') ? null : newsCard;
        },
        url: '.title',
        title: '.title',
        actionTarget: '.source',
        actionStyle: {
          marginLeft: '6px',
          flex: '0 100000 auto !important',
        },
      },
    ],
    pagerHandlers: [
      {
        target: '.news-card',
        innerTargets: '.source',
      },
    ],
  }),
};

export function getDesktopSerpHandler(path: string): SerpHandler | null {
  return serpHandlers[path] || null;
}

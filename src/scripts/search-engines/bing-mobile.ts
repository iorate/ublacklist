import * as S from 'microstruct';
import { CSSAttribute, glob } from '../styles';
import { SerpColors, SerpHandler } from '../types';
import { getDialogThemeFromBody, handleSerp } from './helpers';

function applyGlobalStyle(extraStyles?: CSSAttribute): (colors: SerpColors) => void {
  return colors => {
    glob({
      '[data-ub-blocked="visible"]': {
        backgroundColor: `${colors.blockColor ?? 'rgba(255, 192, 192, 0.5)'} !important`,
      },
      '.ub-button': {
        color: colors.linkColor != null ? `${colors.linkColor} !important` : 'rgb(26, 13, 171)',
      },
      ...Object.fromEntries(
        colors.highlightColors.map((highlightColor, i) => [
          `[data-ub-highlight="${i + 1}"]`,
          {
            backgroundColor: `${highlightColor} !important`,
          },
        ]),
      ),
      ...(extraStyles || {}),
    });
  };
}

const serpHandlers: Readonly<Record<string, SerpHandler | undefined>> = {
  '/search': handleSerp({
    globalStyle: applyGlobalStyle(),
    controlHandlers: [
      {
        target: '#b_results',
        position: 'beforebegin',
        style: {
          display: 'block',
          fontSize: '14px',
          lineHeight: '20px',
          margin: '16px 24px',
        },
        buttonStyle: 'b_alink',
      },
    ],
    entryHandlers: [
      {
        target: '.b_algo',
        url: 'a',
        title: 'h2',
        actionTarget: '',
        actionStyle: {
          display: 'block',
        },
        actionButtonStyle: 'b_alink',
      },
    ],
    pagerHandlers: [
      {
        target: '#b_content',
        innerTargets: '.b_algo',
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  }),
  '/images/search': handleSerp({
    globalStyle: applyGlobalStyle({
      '.dgControl_list > li': {
        marginBottom: '8px',
        paddingBottom: '0 !important',
      },
      '[data-ub-blocked] .iuscp, [data-ub-blocked] .infopt, [data-ub-highlight] .iuscp, [data-ub-highlight] .infopt':
        {
          backgroundColor: 'transparent !important',
        },
    }),
    controlHandlers: [
      {
        target: '.dg_b',
        position: 'beforebegin',
        style: {
          display: 'block',
          fontSize: '11px',
          lineHeight: '16px',
          margin: '0 8px 16px',
        },
        buttonStyle: 'b_alink',
      },
    ],
    entryHandlers: [
      {
        target: '.infsd',
        level: '.dgControl_list > li',
        url: root => {
          const m = root.querySelector<HTMLElement>('.iusc')?.getAttribute('m');
          return m != null ? S.parse(m, S.type({ purl: S.string() }))?.purl ?? null : null;
        },
        title: '.infpd a',
        actionTarget: '.infnmpt',
        actionStyle: {
          display: 'block',
          fontSize: '11px',
          lineHeight: '16px',
          marginTop: '-8px',
          overflow: 'hidden',
          padding: '8px 0',
          pointerEvents: 'auto',
          textOverflow: 'ellipsis',
        },
        actionButtonStyle: 'b_alink',
      },
    ],
    pagerHandlers: [
      {
        target: '.dgControl_list > li',
        innerTargets: '.infsd',
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  }),
  '/videos/search': handleSerp({
    globalStyle: applyGlobalStyle({
      '[data-ub-blocked] .mc_vtvc, [data-ub-highlight] .mc_vtvc': {
        backgroundColor: 'transparent !important',
      },
    }),
    controlHandlers: [
      {
        target: '#m_vid_result',
        position: 'beforebegin',
        style: {
          display: 'block',
          fontSize: '11px',
          lineHeight: '16px',
          margin: '0 8px 16px',
        },
        buttonStyle: 'b_alink',
      },
    ],
    entryHandlers: [
      {
        target: '.mc_vtvc_meta',
        level: '.dg_u',
        url: root =>
          root.querySelector<HTMLElement>('.mc_vtvc_con_rc')?.getAttribute('ourl') ?? null,
        title: '.mc_vtvc_title',
        actionTarget: '.mc_vtvc_con_rc',
        actionStyle: {
          display: 'block',
          fontSize: '11px',
          lineHeight: '16px',
          marginTop: '-26px',
          overflow: 'hidden',
          padding: '16px',
          position: 'relative',
          textOverflow: 'ellipsis',
        },
        actionButtonStyle: 'b_alink',
      },
    ],
    pagerHandlers: [
      {
        target: '.dg_u',
        innerTargets: '.mc_vtvc_meta',
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  }),
  '/news/search': handleSerp({
    globalStyle: applyGlobalStyle({
      '.newscard': {
        height: '140px !important',
      },
      '.caption': {
        height: '108px !important',
      },
    }),
    controlHandlers: [
      {
        target: '#coreresults',
        position: 'beforebegin',
        style: {
          display: 'block',
          fontSize: '12px',
          lineHeight: '18px',
          margin: '16px 25px',
        },
        buttonStyle: 'b_alink',
      },
    ],
    entryHandlers: [
      {
        target: '.bottom',
        level: '.newscard',
        url: '.title',
        title: '.title',
        actionTarget: '.caption',
        actionStyle: {
          flex: 'none',
          fontSize: '12px',
          lineHeight: '18px',
          marginTop: '8px',
        },
        actionButtonStyle: 'b_alink',
      },
    ],
    pagerHandlers: [
      {
        target: '.newscard',
        innerTargets: '.bottom',
      },
    ],
    getDialogTheme: getDialogThemeFromBody(),
  }),
};

export function getMobileSerpHandler(path: string): SerpHandler | null {
  return serpHandlers[path] || null;
}

import { SerpHandler } from '../types';
import { AltURL, MatchPattern } from '../utilities';
import { handleSerp } from './helpers';

export function getSerpHandler(): SerpHandler {
  const serpHandler = handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
      },
      '.ub-button': {
        color: 'var(--ub-link-color, rgb(93, 96, 94))',
      }, // Lite Qwant
      '.theme-dark .ub-button': {
        color: 'var(--ub-link-color, rgb(122, 140, 109))',
      },// Standard Qwant
      '[data-theme="dark"] .ub-button': {
        color: 'var(--ub-link-color, rgb(122, 140, 109))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
    },
    controlHandlers: [
      {
        target: '[class*=SearchFilter-module__SearchFilter]',
        position: 'afterbegin',
        style: {
          display: 'block',
          fontSize: '13px',
          padding: '9px 20px',
          textAlign: 'right',
        },
      },
      {
        target: '[data-testid=buttonShowMore]',
        position: 'afterbegin',
        style: {
          display: 'block',
          fontSize: '13px',
          padding: '9px 20px',
          textAlign: 'right',
        },
      },
      {
        target: '[class*=SearchHeader-module__SearchHeaderNavBar]',
        position: 'afterend',
        style: {
          display: 'block',
          fontSize: '13px',
          padding: '9px 20px',
          textAlign: 'right',
        },
      }
    ],
    entryHandlers: [
      {
        scope: 'web',
        target: '[domain]',
        url: 'a',
        title: 'a',
        actionTarget: '[class*=WebResult-module__permalink]',
        actionStyle: {
          fontSize: '14px',
          paddingLeft: '5px',
        },
      },
      {
        scope: 'news',
        target: '[class*=News-module__NewsList] > div',
        url: 'a',
        title: 'a [class*=News-module__NewsTitle]',
        actionTarget: '[class*=Text-module__permaLink]',
        actionStyle: {
          fontSize: '13px',
          paddingLeft: '5px',
        },
      },
      {
        scope: 'images',
        target: '[data-testid=imageResult]',
        url: root => `https://${root.querySelector('cite')?.textContent || ''}`,
        title: 'h2',
        actionTarget: '[class*=Text-module__permaLink]',
        actionStyle: {
          fontSize: '12px',
          paddingLeft: '5px',
        },
      },
      {
        scope: 'videos',
        target: '[class*=Videos-module__VideoCard]',
        url: root => root.getAttribute('href'),
        title: '[class*=Videos-module__VideoCardTitle]',
        actionTarget: '[class*=Videos-module__VideoCardMeta]',
        actionStyle: {
          display: 'block',
          fontSize: '13px',
        },
      },
      {
        scope: 'lite',
        target: 'article',
        url: root => root.querySelector('.url')?.textContent || null,
        title: 'a',
        actionTarget: '.url',
        actionStyle: {
          fontSize: '13px',
          paddingLeft: '5px',
        },
      }
    ],
    pagerHandlers: [
      {
        target: '[data-testid=sectionWeb]',
        innerTargets: '[class*=Stack-module__VerticalStack]',
      },
      {
        target: '[class*=SearchLayout-module__content]',
        innerTargets: '[class*=Web-module__container]'
      }
    ],
    getDialogTheme: () => document.body.dataset.theme === 'dark' || document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light'
  });

  const url = new AltURL(window.location.href);
  const needsAsyncInject = new MatchPattern('https://www.qwant.com/*').test(url)

  return {
    onSerpStart: serpHandler.onSerpStart,
    onSerpHead: serpHandler.onSerpHead,
    onSerpElement: serpHandler.onSerpElement,
    onSerpElementDelay: needsAsyncInject ? 1000 : 0,
    getDialogTheme: serpHandler.getDialogTheme
  };
}

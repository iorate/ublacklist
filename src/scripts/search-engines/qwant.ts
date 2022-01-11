import { SerpHandler } from '../types';
import { handleSerp } from './helpers';

export function getSerpHandler(): SerpHandler {
  const serpHandler = handleSerp({
    globalStyle: {
      '[data-ub-blocked="visible"]': {
        backgroundColor: 'var(--ub-block-color, rgba(255, 192, 192, 0.5)) !important',
      },
      '.theme-dark [data-ub-blocked="visible"], [data-theme="dark"] [data-ub-blocked="visible"]': {
        backgroundColor: 'var(--ub-block-color, rgba(101, 8, 8, 0.5)) !important',
      },
      '.ub-button': {
        color: 'var(--ub-link-color, rgb(93, 96, 94))',
      },
      '.theme-dark .ub-button, [data-theme="dark"] .ub-button': {
        color: 'var(--ub-link-color, rgb(122, 140, 109))',
      },
      '.ub-button:hover': {
        textDecoration: 'underline',
      },
      'div[class*=WebResult-module__permalink]': {
        display: 'flex',
        maxWidth: 'auto',
      },
      '.qwant-control': {
        display: 'block',
        fontSize: '13px',
        marginTop: '10px',
        color: 'rgb(89, 89, 95)',
      },
      '.theme-dark .qwant-control, [data-theme="dark"] .qwant-control': {
        color: 'rgb(217, 217, 224)',
      },
      '.qwant-lite-control': {
        display: 'block',
        fontSize: '13px',
        marginBottom: '10px',
        color: 'rgb(89, 89, 95)',
      },
      '.theme-dark .qwant-lite-control, [data-theme="dark"] .qwant-lite-control': {
        color: 'rgb(217, 217, 224)',
      },
    },
    controlHandlers: [
      {
        target: '[class*=SearchFilter-module__SearchFilter___]',
        position: 'beforeend',
        style: 'qwant-control',
      },
      {
        target: 'section.content',
        position: 'afterbegin',
        style: 'qwant-lite-control',
      },
    ],
    entryHandlers: [
      {
        // Web
        target: '[domain]',
        url: 'a',
        title: 'a',
        actionTarget: '[class*=WebResult-module__permalink]',
        actionStyle: {
          fontSize: '13px',
          paddingLeft: '5px',
        },
      },
      {
        // News
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
        // Images
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
        // Videos
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
        // Lite
        target: 'article',
        url: root => root.querySelector('.url')?.textContent || null,
        title: 'a',
        actionTarget: '.url',
        actionStyle: {
          fontSize: '13px',
          paddingLeft: '5px',
        },
      },
    ],
    pagerHandlers: [
      {
        target: '[class*=Web-module], [class*=Stack-module__VerticalStack]',
        innerTargets: '[domain], [class*=SearchFilter-module__SearchFilter___]',
      },
      {
        target: '[class*=News-module], [class*=Stack-module__VerticalStack]',
        innerTargets:
          '[class*=News-module__NewsList] > div, [class*=SearchFilter-module__SearchFilter___]',
      },
      {
        target: '[class*=Images-module], [class*=Stack-module__VerticalStack]',
        innerTargets: '[data-testid=imageResult], [class*=SearchFilter-module__SearchFilter___]',
      },
      {
        target: '[data-testid=videosList]',
        innerTargets: '[class*=SearchFilter-module__SearchFilter___]',
      },
    ],
    getDialogTheme: () =>
      document.body.dataset.theme === 'dark' ||
      document.documentElement.classList.contains('theme-dark')
        ? 'dark'
        : 'light',
  });

  return {
    onSerpStart: serpHandler.onSerpStart,
    onSerpHead: serpHandler.onSerpHead,
    onSerpElement: serpHandler.onSerpElement,
    getDialogTheme: serpHandler.getDialogTheme,
  };
}

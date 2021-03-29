import { CSSAttribute, css, glob } from '../styles';
import { DialogTheme, SerpControl, SerpEntry, SerpHandler, SerpHandlerResult } from '../types';
import { makeAltURL } from '../utilities';

export function getParentElement(element: HTMLElement, level = 1): HTMLElement {
  let current = element;
  for (let i = 0; i < level; ++i) {
    const parent = current.parentElement;
    if (!parent) {
      return current;
    }
    current = parent;
  }
  return current;
}

export function insertElement(
  tagName: string,
  target: HTMLElement,
  position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend',
): HTMLElement {
  const element = document.createElement(tagName);
  if (position === 'beforebegin') {
    getParentElement(target).insertBefore(element, target);
  } else if (position === 'afterbegin') {
    target.insertBefore(element, target.firstChild);
  } else if (position === 'beforeend') {
    target.appendChild(element);
  } else {
    getParentElement(target).insertBefore(element, target.nextSibling);
  }
  return element;
}

export function handleSerpStart({
  targets,
  onSerpElement,
}: {
  targets: string | (() => HTMLElement[]);
  onSerpElement: (element: HTMLElement) => SerpHandlerResult;
}): () => SerpHandlerResult {
  /* #if CHROME_MV3 || FIREFOX
  return () => ({ controls: [], entries: [] });
  */
  // #else
  return () => {
    const controls: SerpControl[] = [];
    const entries: SerpEntry[] = [];
    for (const element of typeof targets === 'string'
      ? document.querySelectorAll<HTMLElement>(targets)
      : targets()) {
      const { controls: elementControls, entries: elementEntries } = onSerpElement(element);
      controls.push(...elementControls);
      entries.push(...elementEntries);
    }
    return { controls, entries };
  };
  // #endif
}

export function handleSerpHead({
  globalStyle,
}: {
  globalStyle: CSSAttribute | (() => void);
}): () => SerpHandlerResult {
  return () => {
    if (typeof globalStyle === 'object') {
      glob(globalStyle);
    } else {
      globalStyle();
    }
    return { controls: [], entries: [] };
  };
}

export type ControlHandler = {
  scope?: string;
  target: string | ((element: HTMLElement) => boolean);
  position?:
    | 'beforebegin'
    | 'afterbegin'
    | 'beforeend'
    | 'afterend'
    | ((target: HTMLElement) => HTMLElement | null);
  style?: string | CSSAttribute | ((root: HTMLElement) => void);
  buttonStyle?: string | CSSAttribute | ((button: HTMLElement) => void);
};

export type EntryHandler = {
  scope?: string;
  target: string | ((element: HTMLElement) => boolean);
  level?: number | string | ((target: HTMLElement) => HTMLElement | null);
  url: string | ((root: HTMLElement) => string | null);
  title?: string | ((root: HTMLElement) => string | null);
  actionTarget: string | ((root: HTMLElement) => HTMLElement | null);
  actionPosition?:
    | 'beforebegin'
    | 'afterbegin'
    | 'beforeend'
    | 'afterend'
    | ((target: HTMLElement) => HTMLElement | null);
  actionStyle?: string | CSSAttribute | ((actionRoot: HTMLElement) => void);
  actionButtonStyle?: string | CSSAttribute | ((button: HTMLElement) => void);
};

export type PagerHandler = {
  target: string | ((element: HTMLElement) => boolean);
  innerTargets: string | ((target: HTMLElement) => HTMLElement[]);
};

function handleRender(
  root: HTMLElement,
  buttonStyle: string | CSSAttribute | ((button: HTMLElement) => void),
): () => void {
  let applyButtonStyle: (button: HTMLElement) => void;
  if (typeof buttonStyle === 'string') {
    applyButtonStyle = button => button.classList.add(buttonStyle);
  } else if (typeof buttonStyle === 'object') {
    const class_ = css(buttonStyle);
    applyButtonStyle = button => button.classList.add(class_);
  } else {
    applyButtonStyle = buttonStyle;
  }
  return () => root.querySelectorAll<HTMLElement>('.ub-button').forEach(applyButtonStyle);
}

export function handleSerpElement({
  controlHandlers,
  entryHandlers,
  pagerHandlers = [],
}: {
  controlHandlers: ControlHandler[];
  entryHandlers: EntryHandler[];
  pagerHandlers?: PagerHandler[];
}): (element: HTMLElement) => SerpHandlerResult {
  const entryRoots = new WeakSet<HTMLElement>();
  const onSerpElement = (element: HTMLElement): SerpHandlerResult => {
    const controls: SerpControl[] = [];
    const entries: SerpEntry[] = [];
    for (const {
      scope = '',
      target,
      position = 'beforeend',
      style,
      buttonStyle,
    } of controlHandlers) {
      if (!(typeof target === 'string' ? element.matches(target) : target(element))) {
        continue;
      }
      const controlRoot =
        typeof position === 'string' ? insertElement('span', element, position) : position(element);
      if (!controlRoot) {
        continue;
      }
      if (style == null) {
        // NOP
      } else if (typeof style === 'string') {
        controlRoot.className = style;
      } else if (typeof style === 'object') {
        controlRoot.className = css(style);
      } else {
        style(controlRoot);
      }
      controls.push({
        scope,
        root: controlRoot,
        onRender: buttonStyle != null ? handleRender(controlRoot, buttonStyle) : undefined,
      });
    }
    for (const {
      scope = '',
      target,
      level = 0,
      url,
      title,
      actionTarget,
      actionPosition = 'beforeend',
      actionStyle,
      actionButtonStyle,
    } of entryHandlers) {
      if (!(typeof target === 'string' ? element.matches(target) : target(element))) {
        continue;
      }
      const entryRoot =
        typeof level === 'number'
          ? getParentElement(element, level)
          : typeof level === 'string'
          ? element.closest<HTMLElement>(level)
          : level(element);
      if (!entryRoot || entryRoots.has(entryRoot)) {
        continue;
      }
      let entryURL: string | null = null;
      if (typeof url === 'string') {
        const a = url ? entryRoot.querySelector<HTMLElement>(url) : entryRoot;
        if (a instanceof HTMLAnchorElement) {
          entryURL = a.href || null;
        }
      } else {
        entryURL = url(entryRoot);
      }
      if (entryURL == null) {
        continue;
      }
      const entryAltURL = makeAltURL(entryURL);
      if (entryAltURL == null) {
        continue;
      }
      let entryTitle: string | null;
      if (title == null) {
        entryTitle = null;
      } else if (typeof title === 'string') {
        entryTitle = entryRoot.querySelector<HTMLElement>(title)?.innerText ?? null;
      } else {
        entryTitle = title(entryRoot);
      }
      const entryActionTarget =
        typeof actionTarget === 'string'
          ? actionTarget
            ? entryRoot.querySelector<HTMLElement>(actionTarget)
            : entryRoot
          : actionTarget(entryRoot);
      if (!entryActionTarget) {
        continue;
      }
      const entryActionRoot =
        typeof actionPosition === 'string'
          ? insertElement('span', entryActionTarget, actionPosition)
          : actionPosition(entryActionTarget);
      if (!entryActionRoot) {
        continue;
      }
      if (actionStyle == null) {
        // NOP
      } else if (typeof actionStyle === 'string') {
        entryActionRoot.className = actionStyle;
      } else if (typeof actionStyle === 'object') {
        entryActionRoot.className = css(actionStyle);
      } else {
        actionStyle(entryActionRoot);
      }
      entries.push({
        scope,
        root: entryRoot,
        actionRoot: entryActionRoot,
        onActionRender:
          actionButtonStyle != null ? handleRender(entryActionRoot, actionButtonStyle) : undefined,
        props: {
          url: entryAltURL,
          title: entryTitle,
        },
        state: -1,
      });
      entryRoots.add(entryRoot);
    }
    for (const { target, innerTargets } of pagerHandlers) {
      if (!(typeof target === 'string' ? element.matches(target) : target(element))) {
        continue;
      }
      const pagerElements =
        typeof innerTargets === 'string'
          ? element.querySelectorAll<HTMLElement>(innerTargets)
          : innerTargets(element);
      for (const pagerElement of pagerElements) {
        const { controls: pagerControls, entries: pagerEntries } = onSerpElement(pagerElement);
        controls.push(...pagerControls);
        entries.push(...pagerEntries);
      }
    }
    return { controls, entries };
  };
  return onSerpElement;
}

export function handleSerp({
  globalStyle,
  targets,
  controlHandlers,
  entryHandlers,
  pagerHandlers = [],
  getDialogTheme = () => 'light',
}: {
  globalStyle: CSSAttribute | (() => void);
  targets: string | (() => HTMLElement[]);
  controlHandlers: ControlHandler[];
  entryHandlers: EntryHandler[];
  pagerHandlers?: PagerHandler[];
  getDialogTheme?: () => DialogTheme;
}): SerpHandler {
  const onSerpElement = handleSerpElement({ controlHandlers, entryHandlers, pagerHandlers });
  return {
    onSerpStart: handleSerpStart({ targets, onSerpElement }),
    onSerpHead: handleSerpHead({ globalStyle }),
    onSerpElement,
    getDialogTheme,
  };
}

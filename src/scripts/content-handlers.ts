declare global {
  interface Window {
    ubContentHandlers: ContentHandlers | null;
  }
}

export interface ContentHandlers {
  controlHandlers: ControlHandler[];
  entryHandlers: EntryHandler[];
  autoPagerizeHandlers?: AutoPagerizeHandler[];
}

export interface ControlHandler {
  createControl: () => HTMLElement | null;
}

export interface EntryHandler {
  getBase: (addedElement: HTMLElement) => HTMLElement | null;
  getURL: (base: HTMLElement) => string | null;
  createAction: (base: HTMLElement) => HTMLElement | null;
  modifyDOM?: (base: HTMLElement) => void;
}

export interface AutoPagerizeHandler {
  getAddedElements: (autoPagerizedElement: HTMLElement) => HTMLElement[] | null;
}

export function createControlDefault(
  parentSelector: string,
  className: string,
): () => HTMLElement | null {
  return (): HTMLElement | null => {
    const parent = document.querySelector(parentSelector);
    if (!parent) {
      return null;
    }
    const control = document.createElement('div');
    control.className = className;
    parent.appendChild(control);
    return control;
  };
}

export function getBaseDefault(
  selector: string,
  depth: number = 0,
): (addedElement: HTMLElement) => HTMLElement | null {
  return (addedElement: HTMLElement): HTMLElement | null => {
    if (!addedElement.matches(selector)) {
      return null;
    }
    let base: HTMLElement | null = addedElement;
    for (let i = 0; i < depth && base; ++i) {
      base = base.parentElement;
    }
    return base;
  };
}

export function getURLDefault(selector: string): (base: HTMLElement) => string | null {
  return (base: HTMLElement): string | null => {
    const a = selector ? base.querySelector(`:scope ${selector}`) : base;
    if (!a) {
      return null;
    }
    return a.getAttribute('href');
  };
}

export function createActionDefault(
  parentSelector: string,
  className: string,
): (base: HTMLElement) => HTMLElement | null {
  return (base: HTMLElement): HTMLElement | null => {
    const parent = parentSelector ? base.querySelector(`:scope ${parentSelector}`) : base;
    if (!parent) {
      return null;
    }
    const action = document.createElement('div');
    action.className = className;
    parent.appendChild(action);
    return action;
  };
}

export function getAddedElementsDefault(
  selector: string,
): (autoPagerizedElement: HTMLElement) => HTMLElement[] | null {
  return (autoPagerizedElement: HTMLElement): HTMLElement[] | null =>
    Array.from<HTMLElement>(autoPagerizedElement.querySelectorAll(selector));
}

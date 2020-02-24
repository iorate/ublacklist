declare global {
  interface Window {
    ubContentHandlers: ContentHandlers | null;
  }
}

export interface ContentHandlers {
  controlHandlers: ControlHandler[];
  entryHandlers: EntryHandler[];
  pageHandlers?: PageHandler[];
}

export interface ControlHandler {
  createControl: () => HTMLElement | null;
}

export interface EntryHandler {
  getEntries: (addedElement: HTMLElement) => HTMLElement[];
  getURL: (entry: HTMLElement) => string | null;
  createAction: (entry: HTMLElement) => HTMLElement | null;
  adjustEntry?: (entry: HTMLElement) => void;
}

export interface PageHandler {
  getAddedElements: (page: HTMLElement) => HTMLElement[];
}

export function createControlDefault(
  parentSelector: string,
  className: string,
): () => HTMLElement | null {
  return () => {
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

export function getEntriesDefault(
  selector: string,
  depth: number = 0,
): (addedElement: HTMLElement) => HTMLElement[] {
  return addedElement => {
    if (!addedElement.matches(selector)) {
      return [];
    }
    let entry: HTMLElement | null = addedElement;
    for (let i = 0; i < depth && entry; ++i) {
      entry = entry.parentElement;
    }
    return entry ? [entry] : [];
  };
}

export function getURLDefault(selector: string): (entry: HTMLElement) => string | null {
  return entry => {
    const a = selector ? entry.querySelector(`:scope ${selector}`) : entry;
    if (!a || a.tagName !== 'A') {
      return null;
    }
    return (a as HTMLAnchorElement).href;
  };
}

export function createActionDefault(
  parentSelector: string,
  className: string,
): (entry: HTMLElement) => HTMLElement | null {
  return entry => {
    const parent = parentSelector ? entry.querySelector(`:scope ${parentSelector}`) : entry;
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
  pageSelector: string,
  selector: string,
): (page: HTMLElement) => HTMLElement[] {
  return page => {
    if (!page.matches(pageSelector)) {
      return [];
    }
    return Array.from<HTMLElement>(page.querySelectorAll(selector));
  };
}

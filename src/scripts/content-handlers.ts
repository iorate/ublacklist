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
  getEntries: (addedElement: HTMLElement) => HTMLElement[];
  getURL: (entry: HTMLElement) => string | null;
  createAction: (entry: HTMLElement) => HTMLElement | null;
  adjustEntry?: (entry: HTMLElement) => void;
}

export interface AutoPagerizeHandler {
  getAddedElements: (autoPagerizedElement: HTMLElement) => HTMLElement[];
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

export function getEntriesDefault(
  selector: string,
  depth: number = 0,
): (addedElement: HTMLElement) => HTMLElement[] {
  return (addedElement: HTMLElement): HTMLElement[] => {
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
  return (entry: HTMLElement): string | null => {
    const a = selector ? entry.querySelector(`:scope ${selector}`) : entry;
    return a?.getAttribute('href') ?? null;
  };
}

export function createActionDefault(
  parentSelector: string,
  className: string,
): (entry: HTMLElement) => HTMLElement | null {
  return (entry: HTMLElement): HTMLElement | null => {
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
  selector: string,
): (autoPagerizedElement: HTMLElement) => HTMLElement[] {
  return (autoPagerizedElement: HTMLElement): HTMLElement[] =>
    Array.from<HTMLElement>(autoPagerizedElement.querySelectorAll(selector));
}

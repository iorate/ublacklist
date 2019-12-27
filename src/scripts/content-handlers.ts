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
  getEntryCandidates: (addedElement: HTMLElement) => HTMLElement[];
  getURL: (entryCandidate: HTMLElement) => string | null;
  createAction: (entryCandidate: HTMLElement) => HTMLElement | null;
  modifyEntry?: (entry: HTMLElement) => void;
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

export function getEntryCandidatesDefault(
  selector: string,
  depth: number = 0,
): (addedElement: HTMLElement) => HTMLElement[] {
  return (addedElement: HTMLElement): HTMLElement[] => {
    if (!addedElement.matches(selector)) {
      return [];
    }
    let entryCandidate: HTMLElement | null = addedElement;
    for (let i = 0; i < depth && entryCandidate; ++i) {
      entryCandidate = entryCandidate.parentElement;
    }
    return entryCandidate ? [entryCandidate] : [];
  };
}

export function getURLDefault(selector: string): (entryCandidate: HTMLElement) => string | null {
  return (entryCandidate: HTMLElement): string | null => {
    const a = selector ? entryCandidate.querySelector(`:scope ${selector}`) : entryCandidate;
    return a?.getAttribute('href') ?? null;
  };
}

export function createActionDefault(
  parentSelector: string,
  className: string,
): (entryCandidate: HTMLElement) => HTMLElement | null {
  return (entryCandidate: HTMLElement): HTMLElement | null => {
    const parent = parentSelector
      ? entryCandidate.querySelector(`:scope ${parentSelector}`)
      : entryCandidate;
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

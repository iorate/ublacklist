// To add support for a search engine, define `window.ubContentHandlers`.
declare global {
  interface Window {
    ubContentHandlers: ContentHandlers | null;
  }
}

export interface ContentHandlers {
  controlHandlers: ControlHandler[];
  entryHandlers: EntryHandler[];
  staticElementHandler?: StaticElementHandler;
  dynamicElementHandlers?: DynamicElementHandler[];
}

// A 'Control' means an element which includes the number of blocked sites and show/hide buttons.
// It is typically located before search results.
export interface ControlHandler {
  createControl: () => HTMLElement | null;

  // `adjustControl(control)` is called after a control is set up.
  adjustControl?: (control: HTMLElement) => void;
}

// An 'Entry' means an element which represents an item of search results.
export interface EntryHandler {
  // `getEntry(addedElement)` extracts an entry from an added element.
  // An added element is detected by `MutationObserver`.
  getEntry: (addedElement: HTMLElement) => HTMLElement | null;

  getURL: (entry: HTMLElement) => string | null;

  // 'Action' means an element which includes block/unblock buttons.
  createAction: (entry: HTMLElement) => HTMLElement | null;

  // `adjustEntry(entry)` is called after an entry is set up.
  adjustEntry?: (entry: HTMLElement) => void;
}

// A 'Static Element' means an element which already exists when a content script is injected.
// Entries in static elements are not detected by `MutationObserver`,
// so should be 'salvaged' by `StaticElementHandler`.
//
// Static elements exist when
// - the browser is Chrome,
// - the search engine is other than Google,
// - and the background page is sleeping.
export interface StaticElementHandler {
  getStaticElements: () => HTMLElement[];
}

// A 'Dynamic Element' means an element which is dynamically added by JavaScript.
// Entries in dynamic elements are not detected by `MutationObserver`,
// so should be salvaged by `DynamicElementHandler`.
export interface DynamicElementHandler {
  getDynamicElements: (addedElement: HTMLElement) => HTMLElement[] | null;
}

// `createControlBefore(className, nextSiblingSelector)` creates an element of a class `className`
// and insert it before an element designated by `nextSiblingSelector`.
export function createControlBefore(
  className: string,
  nextSiblingSelector: string,
): () => HTMLElement | null {
  return () => {
    const nextSibling = document.querySelector(nextSiblingSelector);
    if (!nextSibling) {
      return null;
    }
    const control = document.createElement('div');
    control.className = className;
    nextSibling.parentElement!.insertBefore(control, nextSibling);
    return control;
  };
}

// `createControlUnder(className, parentSelector)` creates an element of a class `className`
// and append it to an element designated by `parentSelector`.
export function createControlUnder(
  className: string,
  parentSelector: string,
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

// `getEntry(selector)` returns an added element if it matches `selector`, `null` otherwise.
//
// Just after an entry is added to a DOM tree, it may not contain an element which has its URL
// or an element to which its action will be added.
// In such a case, you can 'wait' for a descendant element of an entry to be added to a DOM tree
// using `getEntryDefault(selector, depth)`.
// It takes a selector and a depth from an entry of a descendant element.
export function getEntry(
  selector: string,
  depth: number = 0,
): (addedElement: HTMLElement) => HTMLElement | null {
  return addedElement => {
    if (!addedElement.matches(selector)) {
      return null;
    }
    let entry: HTMLElement | null = addedElement;
    for (let i = 0; i < depth; ++i) {
      if (!entry) {
        break;
      }
      entry = entry.parentElement;
    }
    return entry;
  };
}

// `getURL(selector)` extracts a URL from a descendant element of an entry designated by `selector`
// (`''` designates an entry itself).
export function getURL(selector?: string): (entry: HTMLElement) => string | null {
  return entry => {
    const a = selector ? entry.querySelector(selector) : entry;
    if (!a || a.tagName !== 'A') {
      return null;
    }
    return (a as HTMLAnchorElement).href;
  };
}

// `createActionBefore(className, nextSiblingSelector)` creates an element of a class `className`
// and insert it before a descendant element of an entry designated by `nextSiblingSelector`.
export function createActionBefore(
  className: string,
  nextSiblingSelector: string,
): (entry: HTMLElement) => HTMLElement | null {
  return entry => {
    const nextSibling = entry.querySelector(nextSiblingSelector);
    if (!nextSibling) {
      return null;
    }
    const action = document.createElement('div');
    action.className = className;
    nextSibling.parentElement!.insertBefore(action, nextSibling);
    return action;
  };
}

// `createActionUnder(className, parentSelector)` creates an element of a class `className`
// and append it to a descendant element of an entry designated by `parentSelector`
// (`''` designates an entry itself).
export function createActionUnder(
  className: string,
  parentSelector: string,
): (entry: HTMLElement) => HTMLElement | null {
  return entry => {
    const parent = parentSelector ? entry.querySelector(parentSelector) : entry;
    if (!parent) {
      return null;
    }
    const action = document.createElement('div');
    action.className = className;
    parent.appendChild(action);
    return action;
  };
}

export function getStaticElements(staticElementSelector: string): () => HTMLElement[] {
  return () => Array.from(document.querySelectorAll<HTMLElement>(staticElementSelector));
}

export function getDynamicElements(
  addedElementSelector: string,
  dynamicElementSelector: string,
): (addedElement: HTMLElement) => HTMLElement[] | null {
  return addedElement => {
    if (!addedElement.matches(addedElementSelector)) {
      return null;
    }
    return Array.from(addedElement.querySelectorAll<HTMLElement>(dynamicElementSelector));
  };
}

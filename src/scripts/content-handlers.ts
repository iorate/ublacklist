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

// A 'Control' means an element which contains stats and show/hide buttons.
// It is typically located before search results.
export interface ControlHandler {
  // `createControl()` creates a control.
  createControl: () => HTMLElement | null;

  // `adjustControl(control)` is called after `control` is set up.
  adjustControl?: (control: HTMLElement) => void;
}

// An 'Entry' means an element which represents an item of search results.
export interface EntryHandler {
  // `getEntry(addedElement)` extracts an entry from `addedElement`.
  // Added elements are detected by `MutationObserver`.
  getEntry: (addedElement: HTMLElement) => HTMLElement | null;

  // `getURL(entry)` extracts a URL from `entry`.
  getURL: (entry: HTMLElement) => string | null;

  // An 'Action' means an element which contains block/unblock buttons.
  // `createAction(entry)` creates an action of `entry`.
  createAction: (entry: HTMLElement) => HTMLElement | null;

  // `adjustEntry(entry)` is called after `entry` is set up.
  adjustEntry?: (entry: HTMLElement) => void;
}

// A 'Static Element' means an element already added when the content script is injected.
// Static elements are not detected by `MutationObserver`, so should be 'salvaged'.
//
// Static elements exist when
// - the browser is Chrome,
// - the search engine is other than Google,
// - and (typically) the background page is sleeping.
export interface StaticElementHandler {
  // `getStaticElements()` extracts static elements which should be passed to `getEntry`.
  getStaticElements: () => HTMLElement[];
}

// A 'Dynamic Element' means a descendant element of an element dynamically added by JavaScript.
// Dynamic elements are not detected by `MutationObserver`, so should be 'salvaged'.
export interface DynamicElementHandler {
  // `getDynamicElements(addedElement)` extracts dynamic elements from `addedElement`
  // which should be passed to `getEntry`.
  getDynamicElements: (addedElement: HTMLElement) => HTMLElement[] | null;
}

// `createControlBefore(className, nextSiblingSelector)` creates an element of a class `className`
// and insert it before an element designated by `nextSiblingSelector`.
export function createControlBefore(className: string, nextSiblingSelector: string) {
  return (): HTMLElement | null => {
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
// and append it to children of an element designated by `parentSelector`.
export function createControlUnder(className: string, parentSelector: string) {
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

// `getEntry(selector)` returns the added element if it matches `selector`, `null` otherwise.
//
// Just after an entry is added to the DOM tree, it may not contain an element which has its URL
// or an element to which its action is added.
// In such a case, you can 'wait' for a descendant element of the entry to be added to the DOM tree
// using `getEntry(selector, depth)`.
// `selector` designates a descendant element, and `depth` designates its depth from the entry.
export function getEntry(selector: string, depth = 0) {
  return (addedElement: HTMLElement): HTMLElement | null => {
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

// `getURL(selector)` extracts a URL from a descendant element of the entry designated by `selector`
// (an empty string designates the entry itself).
export function getURL(selector: string) {
  return (entry: HTMLElement): string | null => {
    const a = selector ? entry.querySelector(selector) : entry;
    if (!a || a.tagName !== 'A') {
      return null;
    }
    return (a as HTMLAnchorElement).href;
  };
}

// `createActionBefore(className, nextSiblingSelector)` creates an element of a class `className`
// and insert it before a descendant element of the entry designated by `nextSiblingSelector`.
export function createActionBefore(className: string, nextSiblingSelector: string) {
  return (entry: HTMLElement): HTMLElement | null => {
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
// and append it to children of a descendant element of the entry designated by `parentSelector`
// (an empty string designates the entry itself).
export function createActionUnder(className: string, parentSelector: string) {
  return (entry: HTMLElement): HTMLElement | null => {
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

// `getStaticElements(selector)` returns a list of elements which matches `selector`.
export function getStaticElements(selector: string) {
  return (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>(selector));
}

// `getDynamicElements(addedElementSelector, dynamicElementSelector)` returns
// a list of descendant elements of the added element which match `dynamicElementSelector`
// if the added element matches `addedElementSelector`,
// `null` otherwise.
export function getDynamicElements(addedElementSelector: string, dynamicElementSelector: string) {
  return (addedElement: HTMLElement): HTMLElement[] | null => {
    if (!addedElement.matches(addedElementSelector)) {
      return null;
    }
    return Array.from(addedElement.querySelectorAll<HTMLElement>(dynamicElementSelector));
  };
}

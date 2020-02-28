// To add support for a search engine, define `window.ubContentHandlers`.
declare global {
  interface Window {
    ubContentHandlers: ContentHandlers | null;
  }
}

export interface ContentHandlers {
  controlHandlers: ControlHandler[];
  entryHandlers: EntryHandler[];
  containerHandlers?: ContainerHandler[];
}

// 'Control' means an element which includes the number of blocked sites and show/hide buttons.
// It is typically located before search results.
export interface ControlHandler {
  createControl: () => HTMLElement | null;

  // `adjustControl(control)` is called after a control is set up.
  adjustControl?: (control: HTMLElement) => void;
}

// 'Entry' means an element which represents an item of search results.
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

// 'Container' means an element which includes entries.
// When a container is dynamically added by JavaScript, its entries may not be detected
// by 'MutationObserver', so will not be handled by `EntryHandler`.
// In such a case, you can 'salvage' entries from a control using `ControlHandler`.
export interface ContainerHandler {
  getContainer: (addedElement: HTMLElement) => HTMLElement | null;

  getAddedElements: (container: HTMLElement) => HTMLElement[] | null;
}

// `createControlDefault(className, parentSelector)` creates an element of a class `className`
// and append it to an element designated by `parentSelector`.
export function createControlDefault(
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

// `getEntryDefault(selector)` returns an added element if it matches `selector`, `null` otherwise.
//
// Just after an entry is added to a DOM tree, it may not contain an element which has its URL
// or an element to which its action will be added.
// In such a case, you can 'wait' for a descendant element of an entry to be added to a DOM tree
// using `getEntryDefault(selector, depth)`.
// It takes a selector and a depth from an entry of a descendant element.
export function getEntryDefault(
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

// `getURLDefault([selector])` extracts a URL from a descendant element of an entry
// if it is designated by `selector`, from an entry itself otherwise.
export function getURLDefault(selector?: string): (entry: HTMLElement) => string | null {
  return entry => {
    const a = selector != null ? entry.querySelector(selector) : entry;
    if (!a || a.tagName !== 'A') {
      return null;
    }
    return (a as HTMLAnchorElement).href;
  };
}

// `createActionDefault(className[, parentSelector])` creates an element of a class `className`
// and append it to a descendant element of an entry if it is designated by `parentSelector`,
// to an entry itself otherwise.
export function createActionDefault(
  className: string,
  parentSelector?: string,
): (entry: HTMLElement) => HTMLElement | null {
  return entry => {
    const parent = parentSelector != null ? entry.querySelector(parentSelector) : entry;
    if (!parent) {
      return null;
    }
    const action = document.createElement('div');
    action.className = className;
    parent.appendChild(action);
    return action;
  };
}

export function getContainerDefault(
  selector: string,
): (addedElement: HTMLElement) => HTMLElement | null {
  return addedElement => {
    if (!addedElement.matches(selector)) {
      return null;
    }
    return addedElement;
  };
}

export function getAddedElementsDefault(
  selector: string,
): (container: HTMLElement) => HTMLElement[] {
  return container => Array.from<HTMLElement>(container.querySelectorAll(selector));
}

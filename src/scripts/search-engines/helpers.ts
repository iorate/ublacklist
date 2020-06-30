export function createControl(className: string, parentSelector: string): () => HTMLElement | null {
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

export function getEntry(
  selector: string,
  depth = 0,
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

export function getURL(selector: string): (entry: HTMLElement) => string | null {
  return entry => {
    const a = selector ? entry.querySelector(selector) : entry;
    if (!a || a.tagName !== 'A') {
      return null;
    }
    return (a as HTMLAnchorElement).href;
  };
}

export function createAction(
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

export function getAddedElements(selector: string): () => HTMLElement[] {
  return () => Array.from(document.querySelectorAll<HTMLElement>(selector));
}

export function getSilentlyAddedElements(
  selectors: Readonly<Record<string, string>>,
): (addedElement: HTMLElement) => HTMLElement[] {
  return addedElement => {
    for (const addedElementSelector of Object.keys(selectors)) {
      if (addedElement.matches(addedElementSelector)) {
        return Array.from(
          addedElement.querySelectorAll<HTMLElement>(selectors[addedElementSelector]),
        );
      }
    }
    return [];
  };
}

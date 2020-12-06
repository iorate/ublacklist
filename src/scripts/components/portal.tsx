import { nanoid } from 'nanoid';
import { Fragment, FunctionComponent, h } from 'preact';
import { createPortal } from 'preact/compat';
import { useMemo } from 'preact/hooks';

export const Portal: FunctionComponent = ({ children }) => {
  const id = useMemo(() => nanoid(), []);
  let root = document.getElementById(id);
  if (!root) {
    root = document.body.appendChild(document.createElement('div'));
    root.id = id;
  }
  return createPortal(<>{children}</>, root);
};

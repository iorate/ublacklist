import { Fragment, FunctionComponent, h } from 'preact';
import { createPortal } from 'preact/compat';

export const Portal: FunctionComponent<{ id: string }> = ({ children, id }) => {
  let root = document.getElementById(id);
  if (!root) {
    root = document.body.appendChild(document.createElement('div'));
    root.id = id;
  }
  return createPortal(<>{children}</>, root);
};

import { nanoid } from 'nanoid';
import { Fragment, FunctionComponent, h } from 'preact';
import { createPortal } from 'preact/compat';
import { useRef } from 'preact/hooks';

export const Portal: FunctionComponent = ({ children }) => {
  const id = useRef(nanoid());
  let root = document.getElementById(id.current);
  if (!root) {
    root = document.body.appendChild(document.createElement('div'));
    root.id = id.current;
  }
  return createPortal(<>{children}</>, root);
};

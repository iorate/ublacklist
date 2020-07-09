import { Fragment, FunctionComponent, h } from 'preact';
import { createPortal } from 'preact/compat';

export type PortalProps = {
  id: string;
};

export const Portal: FunctionComponent<PortalProps> = props => {
  let root = document.getElementById(props.id);
  if (!root) {
    root = document.body.appendChild(document.createElement('div'));
    root.id = props.id;
  }
  return createPortal(<Fragment>{props.children}</Fragment>, root);
};

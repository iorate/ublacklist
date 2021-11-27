/* eslint-disable import/no-duplicates */
import React from 'react';
import ReactDOM from 'react-dom';
/* eslint-enable */

export type PortalProps = { children?: React.ReactNode; id: string };

export const Portal: React.VFC<PortalProps> = ({ children, id }) => {
  let root = document.getElementById(id);
  if (!root) {
    root = document.body.appendChild(document.createElement('div'));
    root.id = id;
  }
  return ReactDOM.createPortal(<>{children}</>, root);
};

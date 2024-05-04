import ReactDOM from "react-dom";

export type PortalProps = { children?: React.ReactNode; id: string };

export const Portal: React.FC<PortalProps> = ({ children, id }) => {
  let root = document.getElementById(id);
  if (!root) {
    root = document.body.appendChild(document.createElement("div"));
    root.id = id;
  }
  return ReactDOM.createPortal(children, root);
};

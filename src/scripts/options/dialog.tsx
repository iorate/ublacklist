import React from 'react';

export type DialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Dialog: React.FC<Readonly<DialogProps>> = props => {
  const dialog = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (props.open) {
      dialog.current!.focus();
    }
  }, [props.open]);
  return (
    <div
      className={`modal ${props.open ? 'is-active' : ''}`}
      ref={dialog}
      tabIndex={-1}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          props.setOpen(false);
        }
      }}
    >
      <div
        className="modal-background"
        onClick={() => {
          props.setOpen(false);
        }}
      ></div>
      <div className="ub-dialog modal-content box">{props.children}</div>
    </div>
  );
};

import { FunctionComponent, h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

export type DialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Dialog: FunctionComponent<Readonly<DialogProps>> = props => {
  const dialog = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (props.open) {
      dialog.current?.focus();
    }
  }, [props.open]);
  return (
    <div
      class={`modal${props.open ? ' is-active' : ''}`}
      ref={dialog}
      tabIndex={-1}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          props.setOpen(false);
        }
      }}
    >
      <div
        class="modal-background"
        onClick={() => {
          props.setOpen(false);
        }}
      ></div>
      <div class="ub-dialog modal-content">{props.children}</div>
    </div>
  );
};

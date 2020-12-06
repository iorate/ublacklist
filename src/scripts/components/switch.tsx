import { nanoid } from 'nanoid';
import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { FocusCircle, applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type SwitchProps = JSX.IntrinsicElements['input'];

export const Switch = forwardRef((props: SwitchProps, ref: Ref<HTMLInputElement>) => {
  const id = useMemo(() => props.id ?? nanoid(), [props.id]);

  const css = useCSS();
  const theme = useTheme();
  const wrapperClass = useMemo(
    () =>
      css({
        height: '16px',
        position: 'relative',
        width: '34px',
      }),
    [css],
  );
  const inputClass = useMemo(
    () =>
      css({
        opacity: 0,
        pointerEvents: 'none',
      }),
    [css],
  );
  const labelClass = useMemo(
    () =>
      css({
        cursor: 'pointer',
        display: 'block',
        height: '16px',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '34px',
        ':disabled ~ &': {
          cursor: 'default',
          opacity: 0.38,
        },
      }),
    [css],
  );
  const barClass = useMemo(
    () =>
      css({
        background: theme.switch.bar,
        borderRadius: '8px',
        display: 'block',
        height: '12px',
        left: '3px',
        position: 'absolute',
        top: '2px',
        transition: 'background-color linear 80ms',
        width: '28px',
        ':checked ~ * > &': {
          background: theme.switch.barChecked,
        },
      }),
    [css, theme],
  );
  const knobMoverClass = useMemo(
    () =>
      css({
        display: 'block',
        left: 0,
        position: 'absolute',
        top: 0,
        transition: 'left linear 80ms',
        ':checked ~ * > &': {
          left: '18px',
        },
      }),
    [css],
  );
  const knobClass = useMemo(
    () =>
      css({
        background: theme.switch.knob,
        border: theme.switch.knobBorder != null ? `solid 1px ${theme.switch.knobBorder}` : 'none',
        borderRadius: '50%',
        display: 'block',
        height: '16px',
        left: 0,
        position: 'absolute',
        top: 0,
        transition: 'background linear 80ms, border linear 80ms',
        width: '16px',
        ':checked ~ * > * > &': {
          background: theme.switch.knobChecked,
          border: 'none',
        },
      }),
    [css, theme],
  );
  return (
    <div class={wrapperClass}>
      <input {...applyClass(props, inputClass)} id={id} ref={ref} type="checkbox" />
      <label class={labelClass} for={id}>
        <span class={barClass} />
        <span class={knobMoverClass}>
          <span class={knobClass} />
          <FocusCircle depth={2} size="16px" />
        </span>
      </label>
    </div>
  );
});

import { nanoid } from 'nanoid';
import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { FocusCircle, applyClass, useInnerRef } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type CheckBoxProps = JSX.IntrinsicElements['input'];

export const CheckBox = forwardRef((props: CheckBoxProps, ref: Ref<HTMLInputElement>) => {
  const id = props.id ?? nanoid();
  const innerRef = useInnerRef(ref);

  const css = useCSS();
  const theme = useTheme();
  const wrapperClass = useMemo(
    () =>
      css({
        height: '16px',
        position: 'relative',
        width: '16px',
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
        width: '16px',
        ':disabled ~ &': {
          cursor: 'default',
          opacity: 0.38,
        },
      }),
    [css],
  );
  const boxClass = useMemo(
    () =>
      css({
        border: `solid 2px ${theme.checkBox.border}`,
        borderRadius: '2px',
        display: 'block',
        height: '16px',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '16px',
        ':checked ~ * > &': {
          background: theme.checkBox.box,
          border: 'none',
        },
      }),
    [css, theme],
  );
  const checkMarkClass = useMemo(
    () =>
      css({
        borderColor: 'transparent',
        borderStyle: 'solid',
        borderWidth: '0 0 3px 3px',
        display: 'block',
        height: '8px',
        left: 0,
        position: 'absolute',
        top: '3px',
        transform: 'rotate(-45deg) scale(0.75)',
        width: '16px',
        ':checked ~ * > &': {
          borderColor: theme.checkBox.checkMark,
        },
      }),
    [css, theme],
  );

  return (
    <div class={wrapperClass}>
      <input {...applyClass(props, inputClass)} id={id} ref={innerRef} type="checkbox" />
      <span class={labelClass} onClick={() => innerRef.current.click()}>
        <span class={boxClass} />
        <span class={checkMarkClass} />
        <FocusCircle depth={1} size="16px" />
      </span>
    </div>
  );
});

import React, { useMemo } from 'react';
import { DISABLED_OPACITY, INPUT_Z_INDEX } from './constants';
import { FocusCircle, applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type CheckBoxProps = JSX.IntrinsicElements['input'];

export const CheckBox = React.forwardRef<HTMLInputElement, CheckBoxProps>(function CheckBox(
  props,
  ref,
) {
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
        cursor: 'pointer',
        height: '100%',
        margin: 0,
        opacity: 0,
        position: 'absolute',
        width: '100%',
        zIndex: INPUT_Z_INDEX,
        '&:disabled': {
          cursor: 'default',
        },
      }),
    [css],
  );
  const imageClass = useMemo(
    () =>
      css({
        ':disabled + &': {
          opacity: DISABLED_OPACITY,
        },
      }),
    [css],
  );
  const boxClass = useMemo(
    () =>
      css({
        border: `solid 2px ${theme.checkBox.border}`,
        borderRadius: '2px',
        height: '16px',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '16px',
        ':checked + * > &': {
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
        height: '8px',
        left: 0,
        position: 'absolute',
        top: '3px',
        transform: 'rotate(-45deg) scale(0.75)',
        width: '16px',
        ':checked + * > &': {
          borderColor: theme.checkBox.checkMark,
        },
      }),
    [css, theme],
  );

  return (
    <div className={wrapperClass}>
      <input {...applyClass(props, inputClass)} ref={ref} type="checkbox" />
      <div className={imageClass}>
        <div className={boxClass} />
        <div className={checkMarkClass} />
        <FocusCircle depth={1} />
      </div>
    </div>
  );
});

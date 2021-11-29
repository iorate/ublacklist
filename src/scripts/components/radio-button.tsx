import React, { useMemo } from 'react';
import { DISABLED_OPACITY, INPUT_Z_INDEX } from './constants';
import { FocusCircle, applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type RadioButtonProps = JSX.IntrinsicElements['input'];

export const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  function RadioButton(props, ref) {
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
    const circleClass = useMemo(
      () =>
        css({
          border: `solid 2px ${theme.radioButton.unchecked}`,
          borderRadius: '50%',
          height: '16px',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '16px',
          ':checked + * > &': {
            borderColor: theme.radioButton.checked,
          },
        }),
      [css, theme],
    );
    const dotClass = useMemo(
      () =>
        css({
          borderRadius: '50%',
          height: '8px',
          left: '4px',
          position: 'absolute',
          top: '4px',
          width: '8px',
          ':checked + * > &': {
            backgroundColor: theme.radioButton.checked,
          },
        }),
      [css, theme],
    );

    return (
      <div className={wrapperClass}>
        <input {...applyClass(props, inputClass)} ref={ref} type="radio" />
        <div className={imageClass}>
          <div className={circleClass} />
          <div className={dotClass} />
          <FocusCircle depth={1} />
        </div>
      </div>
    );
  },
);

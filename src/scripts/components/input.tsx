import React, { useMemo } from 'react';
import { DISABLED_OPACITY } from './constants';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type InputProps = JSX.IntrinsicElements['input'];

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        background: 'transparent',
        border: `solid 1px ${theme.input.border}`,
        borderRadius: '4px',
        color: theme.text.primary,
        display: 'block',
        font: 'inherit',
        lineHeight: '1.5',
        padding: '0.5em 0.625em',
        width: '100%',
        '&:disabled': {
          opacity: DISABLED_OPACITY,
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
          outline: 'none',
        },
      }),
    [css, theme],
  );
  return <input {...applyClass(props, class_)} ref={ref} />;
});

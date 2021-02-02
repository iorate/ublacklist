import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type InputProps = JSX.IntrinsicElements['input'];

export const Input = forwardRef((props: InputProps, ref: Ref<HTMLInputElement>) => {
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
          opacity: 0.38,
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

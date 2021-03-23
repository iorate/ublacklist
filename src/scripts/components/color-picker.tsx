import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { DISABLED_OPACITY, INPUT_Z_INDEX } from './constants';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type ColorPickerProps = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
} & JSX.IntrinsicElements['input'];

export const ColorPicker = forwardRef((props: ColorPickerProps, ref: Ref<HTMLInputElement>) => {
  const css = useCSS();
  const theme = useTheme();
  const wrapperClass = useMemo(
    () =>
      css({
        height: '36px',
        position: 'relative',
        width: '36px',
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
  const colorClass = useMemo(
    () =>
      css({
        border: `solid 2px ${theme.colorPicker.border}`,
        borderRadius: '25%',
        height: '36px',
        width: '36px',
        ':disabled + &': {
          opacity: DISABLED_OPACITY,
        },
        ':focus + &': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        ':focus:not(:focus-visible) + &': {
          boxShadow: 'none',
        },
        ':focus:not(:-moz-focusring) + &': {
          boxShadow: 'none',
        },
      }),
    [css, theme],
  );

  return (
    <div class={wrapperClass}>
      <input {...applyClass(props, inputClass)} ref={ref} type="color" />
      <div class={colorClass} style={`background-color:${(props.value as string) ?? '#00000'};`} />
    </div>
  );
});

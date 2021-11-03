import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type ButtonProps = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  primary?: boolean;
} & JSX.IntrinsicElements['button'];

export const Button = forwardRef(
  ({ primary = false, ...props }: ButtonProps, ref: Ref<HTMLButtonElement>) => {
    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(() => {
      const buttonTheme = primary ? theme.button.primary : theme.button.secondary;
      return css({
        background: buttonTheme.background,
        border: primary ? 'none' : `solid 1px ${theme.button.secondary.border}`,
        borderRadius: '4px',
        color: buttonTheme.text,
        cursor: 'pointer',
        font: 'inherit',
        height: '2.5em',
        outline: 'none',
        padding: primary ? '0.5em 1em' : 'calc(0.5em - 1px) 1em',
        '&:active': {
          background: buttonTheme.backgroundActive,
        },
        '&:disabled': {
          background: buttonTheme.backgroundDisabled,
          color: buttonTheme.textDisabled,
          cursor: 'default',
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        '&:focus:not(:focus-visible)': {
          boxShadow: 'none',
        },
        '&:focus:not(:-moz-focusring)': {
          boxShadow: 'none',
        },
        '&:hover:not(:active):not(:disabled)': {
          background: buttonTheme.backgroundHovered,
        },
      });
    }, [css, theme, primary]);
    return <button {...applyClass(props, class_)} ref={ref} type="button" />;
  },
);

export type LinkButtonProps = JSX.IntrinsicElements['button'];

export const LinkButton = forwardRef((props: LinkButtonProps, ref: Ref<HTMLButtonElement>) => {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        background: 'transparent',
        border: 'none',
        color: theme.link.text,
        cursor: 'pointer',
        display: 'inline',
        font: 'inherit',
        outline: 'none',
        padding: 0,
        '&:disabled': {
          cursor: 'default',
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        '&:focus:not(:focus-visible)': {
          boxShadow: 'none',
        },
        '&:focus:not(:-moz-focusring)': {
          boxShadow: 'none',
        },
      }),
    [css, theme],
  );
  return <button {...applyClass(props, class_)} ref={ref} />;
});

import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type ButtonProps = {
  primary?: boolean;
} & JSX.IntrinsicElements['button'];

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { primary = false, ...props },
  ref,
) {
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
});

export type LinkButtonProps = JSX.IntrinsicElements['button'];

export const LinkButton = React.forwardRef(function LinkButton(
  props: LinkButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) {
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

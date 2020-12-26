import { JSX, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type ButtonProps = { primary?: boolean } & JSX.IntrinsicElements['button'];

export const Button = forwardRef(
  ({ primary, ...props }: ButtonProps, ref: Ref<HTMLButtonElement>) => {
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
        fontSize: '1em',
        height: '2.5em',
        padding: '0.5em 1em',
        '&:active': {
          background: buttonTheme.backgroundActive,
        },
        '&:disabled': {
          background: buttonTheme.backgroundDisabled,
          color: buttonTheme.textDisabled,
          cursor: 'default',
        },
        '&:focus': {
          outline: 'none',
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        '&:-moz-focusring': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        '&:hover:not(:active):not(:disabled)': {
          background: buttonTheme.backgroundHovered,
        },
      });
    }, [css, theme, primary]);
    return <button {...applyClass(props, class_)} ref={ref} />;
  },
);

export type LinkButtonProps = JSX.IntrinsicElements['span'];

export const LinkButton = forwardRef((props: LinkButtonProps, ref: Ref<HTMLSpanElement>) => {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        color: theme.link.text,
        cursor: 'pointer',
        '&:disabled': {
          cursor: 'default',
        },
        '&:focus': {
          outline: 'none',
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
        '&:-moz-focusring': {
          boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
        },
      }),
    [css, theme],
  );
  return (
    <span
      {...applyClass(props, class_)}
      ref={ref}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.currentTarget.click();
        }
      }}
    />
  );
});

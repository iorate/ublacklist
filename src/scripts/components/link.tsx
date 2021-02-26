import { Fragment, JSX, VNode, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { Ref, useMemo } from 'preact/hooks';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type LinkProps = { disabled?: boolean } & JSX.IntrinsicElements['a'];

export const Link = forwardRef(
  ({ children, disabled, ...props }: LinkProps, ref: Ref<HTMLAnchorElement>) => {
    const css = useCSS();
    const theme = useTheme();
    const class_ = useMemo(
      () =>
        css({
          color: theme.link.text,
          outline: 'none',
          textDecoration: 'none',
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
    return (
      <a
        {...applyClass(props, class_)}
        href={disabled ? undefined : props.href}
        ref={ref}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  },
);

export function expandLinks(text: string, disabled?: boolean): VNode {
  const children: (string | VNode)[] = [];
  const split = text.split(/\[([^\]]*)]\(([^)]*)\)/g);
  for (let i = 0; i < split.length; ++i) {
    if (i % 3 === 0) {
      children.push(split[i]);
    } else if (i % 3 === 1) {
      children.push(
        <Link disabled={disabled} href={split[i + 1]}>
          {split[i]}
        </Link>,
      );
      ++i;
    }
  }
  return <>{children}</>;
}

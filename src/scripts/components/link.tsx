import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type LinkProps = { disabled?: boolean } & JSX.IntrinsicElements['a'];

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { disabled = false, ...props },
  ref,
) {
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
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...applyClass(props, class_)}
      {...(disabled ? {} : { href: props.href })}
      ref={ref}
      rel="noopener noreferrer"
      target="_blank"
    />
  );
});

export function expandLinks(text: string, disabled = false): React.ReactNode {
  const children: React.ReactNode[] = [];
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

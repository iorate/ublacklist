import React, { useMemo } from 'react';
import { applyClass } from './helpers';
import { useCSS } from './styles';
import { useTheme } from './theme';

export type SectionProps = JSX.IntrinsicElements['section'];

export const Section = React.forwardRef<HTMLElement, SectionProps>(function Section(props, ref) {
  const css = useCSS();
  const class_ = useMemo(
    () =>
      css({
        '&:not(:first-child)': {
          marginTop: '2em',
        },
      }),
    [css],
  );
  return <section {...applyClass(props, class_)} ref={ref} />;
});

export type SectionHeaderProps = {
  maxWidth?: string;
} & JSX.IntrinsicElements['div'];

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader({ maxWidth = '640px', ...props }, ref) {
    const css = useCSS();
    const class_ = useMemo(
      () =>
        css({
          marginBottom: '1em',
          [`@media screen and (max-width: ${maxWidth})`]: {
            padding: '0 1.25em',
          },
        }),
      [css, maxWidth],
    );
    return <div {...applyClass(props, class_)} ref={ref} />;
  },
);

export type SectionTitleProps = JSX.IntrinsicElements['h1'];

export const SectionTitle = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(
  function SectionTitle({ children, ...props }, ref) {
    const css = useCSS();
    const class_ = useMemo(
      () =>
        css({
          fontSize: '1.125em',
          fontWeight: 'normal',
          margin: 0,
        }),
      [css],
    );
    return (
      <h1 {...applyClass(props, class_)} ref={ref}>
        {children}
      </h1>
    );
  },
);

export type SectionBodyProps = JSX.IntrinsicElements['div'];

export const SectionBody = React.forwardRef<HTMLDivElement, SectionBodyProps>(function SectionBody(
  props,
  ref,
) {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        background: theme.section.background,
        borderRadius: '4px',
        boxShadow: `0 1px 2px 0 ${theme.section.shadow1}, 0 1px 3px 1px ${theme.section.shadow2}`,
      }),
    [css, theme],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

export type SectionItemProps = JSX.IntrinsicElements['div'];

export const SectionItem = React.forwardRef<HTMLDivElement, SectionItemProps>(function SectionItem(
  props,
  ref,
) {
  const css = useCSS();
  const theme = useTheme();
  const class_ = useMemo(
    () =>
      css({
        padding: '0.75em 1.25em',
        '&:not(:first-child)': {
          borderTop: `solid 1px ${theme.separator}`,
        },
      }),
    [css, theme],
  );
  return <div {...applyClass(props, class_)} ref={ref} />;
});

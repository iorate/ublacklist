import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type SectionProps = JSX.IntrinsicElements["section"];

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  function Section(props, ref) {
    const className = useClassName(
      () => ({
        "&:not(:first-child)": {
          marginTop: "2em",
        },
      }),
      [],
    );
    return <section {...applyClassName(props, className)} ref={ref} />;
  },
);

export type SectionHeaderProps = JSX.IntrinsicElements["div"] & {
  maxWidth?: string;
};

export const SectionHeader = React.forwardRef<
  HTMLDivElement,
  SectionHeaderProps
>(function SectionHeader({ maxWidth = "640px", ...props }, ref) {
  const className = useClassName(
    () => ({
      marginBottom: "1em",
      [`@media screen and (max-width: ${maxWidth})`]: {
        padding: "0 1.25em",
      },
    }),
    [maxWidth],
  );
  return <div {...applyClassName(props, className)} ref={ref} />;
});

export type SectionTitleProps = JSX.IntrinsicElements["h1"];

export const SectionTitle = React.forwardRef<
  HTMLHeadingElement,
  SectionTitleProps
>(function SectionTitle({ children, ...props }, ref) {
  const className = useClassName(
    () => ({
      fontSize: "1.125em",
      fontWeight: "normal",
      margin: 0,
    }),
    [],
  );
  return (
    <h1 {...applyClassName(props, className)} ref={ref}>
      {children}
    </h1>
  );
});

export type SectionBodyProps = JSX.IntrinsicElements["div"];

export const SectionBody = React.forwardRef<HTMLDivElement, SectionBodyProps>(
  function SectionBody(props, ref) {
    const className = useClassName(
      (theme) => ({
        background: theme.section.background,
        borderRadius: "4px",
        boxShadow: `0 1px 2px 0 ${theme.section.shadow1}, 0 1px 3px 1px ${theme.section.shadow2}`,
      }),
      [],
    );
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

export type SectionItemProps = JSX.IntrinsicElements["div"];

export const SectionItem = React.forwardRef<HTMLDivElement, SectionItemProps>(
  function SectionItem(props, ref) {
    const className = useClassName(
      (theme) => ({
        padding: "0.75em 1.25em",
        "&:not(:first-child)": {
          borderTop: `solid 1px ${theme.separator}`,
        },
      }),
      [],
    );
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

import React from "react";
import { applyClassName } from "./helpers.tsx";
import { useClassName } from "./utilities.ts";

export type DetailsProps = JSX.IntrinsicElements["details"];

export const Details = React.forwardRef<HTMLDetailsElement, DetailsProps>(
  function Details(props, ref) {
    return <details {...props} ref={ref} />;
  },
);

export type DetailsSummaryProps = JSX.IntrinsicElements["summary"];

export const DetailsSummary = React.forwardRef<
  HTMLElement,
  DetailsSummaryProps
>(function DetailsSummary(props, ref) {
  const className = useClassName(
    (theme) => ({
      cursor: "pointer",
      outline: "none",
      "&:focus": {
        boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
      },
      "&:focus:not(:focus-visible)": {
        boxShadow: "none",
      },
      "&:focus:not(:-moz-focusring)": {
        boxShadow: "none",
      },
    }),
    [],
  );
  return <summary {...applyClassName(props, className)} ref={ref} />;
});

export type DetailsBodyProps = JSX.IntrinsicElements["div"];

export const DetailsBody = React.forwardRef<HTMLDivElement, DetailsBodyProps>(
  function DetailsBody(props, ref) {
    const className = useClassName(
      () => ({
        marginTop: "1em",
      }),
      [],
    );
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

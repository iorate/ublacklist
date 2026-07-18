import { type ClassValue, clsx } from "clsx";
import type React from "react";

export function mergeClassNames<State>(
  className: string | ((state: State) => string | undefined) | undefined,
  ...ownClassNames: ClassValue[]
): (state: State) => string {
  return (state) =>
    clsx(
      ...ownClassNames,
      typeof className === "function" ? className(state) : className,
    );
}

export function mergeStyle<State>(
  style:
    | React.CSSProperties
    | ((state: State) => React.CSSProperties | undefined)
    | undefined,
  ownStyle: React.CSSProperties,
): (state: State) => React.CSSProperties {
  return (state) => ({
    ...ownStyle,
    ...(typeof style === "function" ? style(state) : style),
  });
}

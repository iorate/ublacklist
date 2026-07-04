import type { CSSAttribute } from "goober";
import { useMemo } from "react";
import { useCSS } from "./styles.tsx";
import { type Theme, useTheme } from "./theme.tsx";

export function useClassName(
  props: (theme: Theme) => CSSAttribute,
  deps: readonly unknown[],
): string {
  const css = useCSS();
  const theme = useTheme();
  // biome-ignore lint/correctness/useExhaustiveDependencies: add `deps` to dependencies
  const className = useMemo(() => css(props(theme)), [css, theme, ...deps]);
  return className;
}

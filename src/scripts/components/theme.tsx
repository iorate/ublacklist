import { useEffect, useInsertionEffect, useState } from "react";

export function useColorScheme(): "light" | "dark" {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setDark(e.matches);
    };
    mediaQueryList.addEventListener("change", listener);
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, []);
  return dark ? "dark" : "light";
}

export function AutoThemeProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const colorScheme = useColorScheme();
  // Apply the theme in an insertion effect, which is guaranteed to fire before
  // any layout effects. A layout effect would be too late: layout effects of
  // child components (e.g. CodeMirror) run first and force a style
  // recalculation, and styles computed at that point, with the theme variables
  // still undefined, would become the start values of CSS transitions
  // animating on the first paint.
  useInsertionEffect(() => {
    document.documentElement.classList.add("root");
    document.documentElement.dataset.theme = colorScheme;
  }, [colorScheme]);
  return children;
}

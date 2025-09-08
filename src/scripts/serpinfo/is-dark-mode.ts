import { colord } from "colord";

export function isDarkMode(): boolean {
  try {
    const bodyColor = colord(
      window.getComputedStyle(document.body).backgroundColor,
    );
    if (bodyColor.alpha() !== 0) {
      return bodyColor.isDark();
    }
    const htmlColor = colord(
      window.getComputedStyle(document.documentElement).backgroundColor,
    );
    return htmlColor.alpha() !== 0 && htmlColor.isDark();
  } catch {
    return false;
  }
}

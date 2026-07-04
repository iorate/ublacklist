import { colord } from "colord";
import { createStore, type StoreApi } from "zustand";

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

export function createIsDarkModeStore(): StoreApi<boolean> {
  const store = createStore<boolean>(() => false);
  const update = () => store.setState(isDarkMode());
  update();
  document.documentElement.addEventListener("transitionstart", update);
  document.body.addEventListener("transitionstart", update);
  return store;
}

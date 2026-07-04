import { type CSSProperties, cssStringify } from "./css-stringify.ts";

let styleElement: HTMLStyleElement | null = null;
const styles: Map<string, string> = new Map();

export function hasGlobalStyle(name: string): boolean {
  return styles.has(name);
}

export function setGlobalStyle(name: string, style: CSSProperties): void {
  styles.set(name, cssStringify(style, 2));
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.setAttribute("data-ub-global-styles", "1");
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = [...styles.values()].join("\n");
}

export function setStaticGlobalStyle(name: string, style: CSSProperties): void {
  if (!hasGlobalStyle(name)) {
    setGlobalStyle(name, style);
  }
}

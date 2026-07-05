import { adoptStyleSheet } from "../shared/adopt-style-sheet.ts";
import { type CSSProperties, cssStringify } from "./css-stringify.ts";

let sheet: CSSStyleSheet | null = null;
const styles: Map<string, string> = new Map();

export function hasGlobalStyle(name: string): boolean {
  return styles.has(name);
}

export function setGlobalStyle(name: string, style: CSSProperties): void {
  styles.set(name, cssStringify(style, 2));
  if (!sheet) {
    sheet = new CSSStyleSheet();
    adoptStyleSheet(document, sheet);
  }
  sheet.replaceSync([...styles.values()].join("\n"));
}

export function setStaticGlobalStyle(name: string, style: CSSProperties): void {
  if (!hasGlobalStyle(name)) {
    setGlobalStyle(name, style);
  }
}

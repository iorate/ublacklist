let styleElement: HTMLStyleElement | null = null;
const styles: Map<string, string> = new Map();

export function has(name: string): boolean {
  return styles.has(name);
}

export function set(name: string, style: string): void {
  styles.set(name, style);
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.setAttribute("data-ub-global-styles", "1");
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = [...styles.values()].join("");
}

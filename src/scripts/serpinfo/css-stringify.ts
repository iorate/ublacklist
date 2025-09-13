import type { Properties } from "csstype";
import { kebabCase } from "es-toolkit";

export interface CSSProperties extends Properties {
  [key: string]: CSSProperties | string | number | undefined;
}

function cssStringifyImpl(
  properties: CSSProperties,
  indent: number | null,
  depth: number,
): string {
  const prefix = indent != null ? " ".repeat(indent * depth) : "";
  const postfix = indent != null ? "\n" : " ";
  let result = "";
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "object") {
      result += `${prefix}${key} {${postfix}`;
      result += cssStringifyImpl(value, indent, depth + 1);
      result += `${prefix}}${postfix}`;
    } else if (value !== undefined) {
      result += `${prefix}${key.startsWith("--") ? key : kebabCase(key)}: ${value};${postfix}`;
    }
  }
  return result;
}

export function cssStringify(
  properties: CSSProperties,
  indent?: number,
): string {
  return cssStringifyImpl(properties, indent ?? null, 0).trim();
}

import type { SaveSource } from "../../shared/types.ts";

export const saveSource: SaveSource = `options-${Math.floor(
  Math.random() * 2 ** 32,
)}`;

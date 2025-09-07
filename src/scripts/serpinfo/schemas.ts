import * as csstree from "css-tree";
import { z } from "zod";
import { parseMatchPattern } from "../../common/match-pattern.ts";

function cssSchema(context: string, message: string) {
  return z.string().refine((value) => {
    try {
      let ok = true;
      csstree.parse(value, {
        context,
        onParseError() {
          ok = false;
        },
      });
      return ok;
    } catch {
      return false;
    }
  }, message);
}

export const cssSelectorListSchema = cssSchema(
  "selectorList",
  "Invalid CSS selector list",
);
export const cssDeclarationListSchema = cssSchema(
  "declarationList",
  "Invalid CSS declaration list",
);
export const cssValueSchema = cssSchema("value", "Invalid CSS value");

export const matchPatternSchema = z
  .string()
  .refine((value) => parseMatchPattern(value) != null, "Invalid match pattern");

export const regexSchema = z.string().refine((value) => {
  try {
    new RegExp(value);
    return true;
  } catch {
    return false;
  }
}, "Invalid regular expression");

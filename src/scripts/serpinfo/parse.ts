import yaml from "js-yaml";
import { createMessageBuilder, fromZodError } from "zod-validation-error";
import {
  type SerpInfo,
  serpInfoSchema,
  serpInfoStrictSchema,
} from "./types.ts";

export type ParseResult =
  | { success: true; data: SerpInfo }
  | { success: false; error: string };

export function parse(
  input: string,
  options: { strict?: boolean; multilineError?: boolean } = {},
): ParseResult {
  const { strict = false, multilineError = false } = options;
  let doc: unknown;
  try {
    doc = yaml.load(input, { schema: yaml.CORE_SCHEMA });
  } catch (error) {
    if (!(error instanceof yaml.YAMLException)) {
      throw error;
    }
    return {
      success: false,
      error: error
        .toString(!multilineError)
        .slice(/* "YAMLException: ".length */ 15),
    };
  }
  const result = (strict ? serpInfoStrictSchema : serpInfoSchema).safeParse(
    doc,
  );
  return result.success
    ? { success: true, data: result.data }
    : {
        success: false,
        error: fromZodError(result.error, {
          messageBuilder: createMessageBuilder({
            issueSeparator: multilineError ? "\n" : "; ",
            prefix: null,
          }),
        }).toString(),
      };
}

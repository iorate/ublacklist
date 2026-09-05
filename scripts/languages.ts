import fs from "node:fs/promises";

import { load } from "js-yaml";
import * as z from "zod";

const languageSchema = z.object({
  browser: z.string(),
  crowdin: z.string(),
  readme: z.string().optional(),
  website: z.string().optional(),
});

export type Language = z.infer<typeof languageSchema>;

export const languages: readonly Language[] = languageSchema
  .array()
  .parse(load(await fs.readFile("languages.yml", { encoding: "utf-8" })));

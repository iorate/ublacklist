import fs from "node:fs/promises";

import { load } from "js-yaml";
import * as z from "zod";

const languagesSchema = z.record(
  z.string(),
  z
    .strictObject({
      crowdin: z.string().optional(),
      readme: z.boolean().optional(),
      website: z.boolean().optional(),
    })
    .nullable(),
);

export type Language = {
  tag: string;
  directory: string;
  crowdin: string;
  readme: boolean;
  website: boolean;
};

export const languages: readonly Language[] = Object.entries(
  languagesSchema.parse(
    load(await fs.readFile("languages.yml", { encoding: "utf-8" })),
  ),
).map(([tag, options]) => ({
  tag,
  directory: tag.replaceAll("-", "_"),
  crowdin: options?.crowdin ?? tag,
  readme: options?.readme ?? false,
  website: options?.website ?? false,
}));

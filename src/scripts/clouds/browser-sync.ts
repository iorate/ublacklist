import dayjs from "dayjs";
import { z } from "zod";
import { browser } from "../browser.ts";

const itemSchema = z.object({
  value: z.string(),
  lastModified: z.iso.datetime(),
});

export const browserSync = {
  async findFile(
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const { [filename]: item } = await browser.storage.sync.get(filename);
    if (item == null) {
      return null;
    }
    const parsedItem = itemSchema.parse(item);
    return { id: filename, modifiedTime: dayjs(parsedItem.lastModified) };
  },

  async readFile(id: string): Promise<{ content: string }> {
    const { [id]: item } = await browser.storage.sync.get(id);
    if (item == null) {
      throw new Error(`Key not found: ${id}`);
    }
    const parsedItem = itemSchema.parse(item);
    return { content: parsedItem.value };
  },

  async writeFile(
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    await browser.storage.sync.set({
      [id]: {
        value: content,
        lastModified: modifiedTime.toISOString(),
      },
    });
  },
};

import fnv1a from "@sindresorhus/fnv1a";
import dayjs from "dayjs";
import { range } from "es-toolkit";
import LZString from "lz-string";
import { z } from "zod";
import { browser } from "../browser.ts";
import { translate } from "../locales.ts";

// QUOTA_BYTES_PER_ITEM (8192)
// - key length (10 bytes for "HHHHHHHH.H" format where H = hex digit)
// - double quotes (2 bytes for JSON serialization)
const CHUNK_SIZE = 8192 - 10 - 2;

// QUOTA_BYTES (102400) / QUOTA_BYTES_PER_ITEM (8192) = 12.5
// Maximum number of chunks allowed per file
const MAX_CHUNK_COUNT = 12;

const metadataSchema = z.object({
  chunkCount: z.int().min(0).max(MAX_CHUNK_COUNT),
  filename: z.string(),
  lastModified: z.iso.datetime(),
});

function computeId(filename: string): string {
  return fnv1a(filename).toString(16).padStart(8, "0");
}

function makeChunkKeys(id: string, chunkCount: number): string[] {
  // chunkCount is guaranteed to be <= MAX_CHUNK_COUNT (12),
  // so i.toString(16) is always a single hex digit (0-b)
  return range(chunkCount).map((i) => `${id}.${i.toString(16)}`);
}

async function writeFileInternal(
  id: string,
  content: string,
  filename: string,
  modifiedTime: dayjs.Dayjs,
  existingChunkCount?: number,
): Promise<void> {
  const compressed = LZString.compressToBase64(content);
  const chunkCount = Math.ceil(compressed.length / CHUNK_SIZE);
  if (chunkCount > MAX_CHUNK_COUNT) {
    throw new Error(translate("clouds_browserSyncQuotaExceeded"));
  }
  try {
    await browser.storage.sync.set({
      [id]: {
        chunkCount,
        filename,
        lastModified: modifiedTime.toISOString(),
      },
      ...Object.fromEntries(
        makeChunkKeys(id, chunkCount).map((key, index) => [
          key,
          compressed.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
        ]),
      ),
    });
  } catch (e) {
    if (e instanceof Error && /quota/i.test(e.message)) {
      throw new Error(translate("clouds_browserSyncQuotaExceeded"));
    }
    throw e;
  }
  if (existingChunkCount != null && existingChunkCount > chunkCount) {
    await browser.storage.sync.remove(
      makeChunkKeys(id, existingChunkCount).slice(chunkCount),
    );
  }
}

export const browserSync = {
  async createFile(
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const id = computeId(filename);
    const { [id]: existingMetadataRaw } = await browser.storage.sync.get(id);
    if (existingMetadataRaw != null) {
      throw new Error(`File already exists: ${filename}`);
    }
    await writeFileInternal(id, content, filename, modifiedTime);
  },

  async findFile(
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const id = computeId(filename);
    const { [id]: metadataRaw } = await browser.storage.sync.get(id);
    if (metadataRaw == null) {
      return null;
    }
    const metadata = metadataSchema.parse(metadataRaw);
    if (metadata.filename !== filename) {
      throw new Error(`Hash collision for filename: ${filename}`);
    }
    return { id, modifiedTime: dayjs(metadata.lastModified) };
  },

  async readFile(id: string): Promise<{ content: string }> {
    const { [id]: metadataRaw } = await browser.storage.sync.get(id);
    if (metadataRaw == null) {
      throw new Error(`Metadata not found: ${id}`);
    }
    const metadata = metadataSchema.parse(metadataRaw);
    const chunkKeys = makeChunkKeys(id, metadata.chunkCount);
    const chunks = await browser.storage.sync.get(chunkKeys);
    const compressed = chunkKeys
      .map((key) => {
        const chunk = chunks[key];
        if (typeof chunk !== "string") {
          throw new Error(`Chunk not found or invalid: ${key}`);
        }
        return chunk;
      })
      .join("");
    return { content: LZString.decompressFromBase64(compressed) };
  },

  async writeFile(
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const { [id]: existingMetadataRaw } = await browser.storage.sync.get(id);
    if (existingMetadataRaw == null) {
      throw new Error(`Metadata not found: ${id}`);
    }
    const existingMetadata = metadataSchema.parse(existingMetadataRaw);
    await writeFileInternal(
      id,
      content,
      existingMetadata.filename,
      modifiedTime,
      existingMetadata.chunkCount,
    );
  },
};

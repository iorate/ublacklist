import { dropbox } from "../sync-backends/dropbox.ts";
import { googleDrive } from "../sync-backends/google-drive.ts";
import type { Cloud, CloudId } from "./types.ts";

export const supportedClouds: Record<CloudId, Cloud> = {
  googleDrive,
  dropbox,
};

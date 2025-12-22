import { dropbox } from "./clouds/dropbox.ts";
import { googleDrive } from "./clouds/google-drive.ts";
import type { Cloud, CloudId } from "./types.ts";

export const supportedClouds: Record<CloudId, Cloud> = {
  googleDrive,
  dropbox,
};

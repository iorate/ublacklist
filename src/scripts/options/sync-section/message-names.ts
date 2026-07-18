import type { MessageName0, SyncBackendId } from "../../shared/types.ts";

export const messageNames: Record<
  SyncBackendId,
  Record<"sync" | "syncTurnedOn" | "syncDescription", MessageName0>
> = {
  googleDrive: {
    sync: "clouds_googleDriveSync",
    syncTurnedOn: "clouds_googleDriveSyncTurnedOn",
    syncDescription: "clouds_googleDriveSyncDescription",
  },
  dropbox: {
    sync: "clouds_dropboxSync",
    syncTurnedOn: "clouds_dropboxSyncTurnedOn",
    syncDescription: "clouds_dropboxSyncDescription",
  },
  webdav: {
    sync: "clouds_webdavSync",
    syncTurnedOn: "clouds_webdavSyncTurnedOn",
    syncDescription: "clouds_webdavSyncDescription",
  },
  browserSync: {
    sync: "clouds_browserSync",
    syncTurnedOn: "clouds_browserSyncTurnedOn",
    syncDescription: "clouds_browserSyncDescription",
  },
};

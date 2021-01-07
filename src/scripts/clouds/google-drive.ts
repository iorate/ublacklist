import dayjs from 'dayjs';
import * as Poi from 'poi-ts';
import { Cloud } from '../types';
import { HTTPError } from '../utilities';
import * as Helpers from './helpers';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const CLIENT_ID = process.env.GOOGLE_DRIVE_API_KEY!;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_API_SECRET!;
/* eslint-enable */
const FILENAME = 'uBlacklist.txt';
const MULTIPART_RELATED_BOUNDARY = '----------uBlacklistMultipartRelatedBoundaryJMPRhmg2VV4JBuua';

export const googleDrive: Cloud = {
  hostPermissions: [
    /* #if FIREFOX
    'https://www.googleapis.com/*',
    */
    // #endif
  ],

  messageNames: {
    sync: 'clouds_googleDriveSync',
    syncDescription: 'clouds_googleDriveSyncDescription',
    syncTurnedOn: 'clouds_googleDriveSyncTurnedOn',
  },

  modifiedTimePrecision: 'millisecond',

  // https://developers.google.com/identity/protocols/oauth2/web-server
  authorize: Helpers.authorize('https://accounts.google.com/o/oauth2/v2/auth', {
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    access_type: 'offline',
    prompt: 'consent select_account',
  }),

  getAccessToken: Helpers.getAccessToken('https://oauth2.googleapis.com/token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),

  refreshAccessToken: Helpers.refreshAccessToken('https://oauth2.googleapis.com/token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),

  // https://developers.google.com/drive/api/v3/reference/files/create
  // https://developers.google.com/drive/api/v3/manage-uploads#multipart
  // https://developers.google.com/drive/api/v3/appdata
  async createFile(accessToken: string, content: string, modifiedTime: dayjs.Dayjs): Promise<void> {
    const requestURL = new URL('https://www.googleapis.com/upload/drive/v3/files');
    requestURL.search = new URLSearchParams({
      uploadType: 'multipart',
    }).toString();
    const response = await fetch(requestURL.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${MULTIPART_RELATED_BOUNDARY}`,
      },
      body: `--${MULTIPART_RELATED_BOUNDARY}\r
Content-Type: application/json; charset=UTF-8\r
\r
${JSON.stringify({
  modifiedTime: modifiedTime.toISOString(),
  name: FILENAME,
  parents: ['appDataFolder'],
})}\r
--${MULTIPART_RELATED_BOUNDARY}\r
Content-Type: text/plain; charset=UTF-8\r
\r
${content}\r
--${MULTIPART_RELATED_BOUNDARY}--`,
    });
    if (response.ok) {
      return;
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },

  // https://developers.google.com/drive/api/v3/reference/files/list
  // https://developers.google.com/drive/api/v3/appdata
  async findFile(accessToken: string): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const requestURL = new URL('https://www.googleapis.com/drive/v3/files');
    requestURL.search = new URLSearchParams({
      // Move authorization from the 'Authorization' header to avoid preflight requests.
      access_token: accessToken,
      fields: 'files(id, modifiedTime)',
      q: `name = '${FILENAME}'`,
      spaces: 'appDataFolder',
    }).toString();
    const response = await fetch(requestURL.toString());
    if (response.ok) {
      const responseBody: unknown = await response.json();
      Poi.validate(
        responseBody,
        Poi.object({
          files: Poi.array(
            Poi.object({
              id: Poi.string(),
              modifiedTime: Poi.string(),
            }),
          ),
        }),
      );
      if (!responseBody.files.length) {
        return null;
      }
      return {
        id: responseBody.files[0].id,
        modifiedTime: dayjs(responseBody.files[0].modifiedTime),
      };
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },

  // https://developers.google.com/drive/api/v3/reference/files/get
  // https://developers.google.com/drive/api/v3/manage-downloads
  async readFile(accessToken: string, id: string): Promise<{ content: string }> {
    const requestURL = new URL(`https://www.googleapis.com/drive/v3/files/${id}`);
    requestURL.search = new URLSearchParams({
      alt: 'media',
    }).toString();
    const response = await fetch(requestURL.toString(), {
      headers: {
        // We cannot move authorization from the 'Authorization' header to avoid preflight requests:
        // https://cloud.google.com/blog/products/application-development/upcoming-changes-to-the-google-drive-api-and-google-picker-api
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      const responseBody = await response.text();
      return { content: responseBody };
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },

  // https://developers.google.com/drive/api/v3/reference/files/update
  // https://developers.google.com/drive/api/v3/manage-uploads#multipart
  async writeFile(
    accessToken: string,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const requestURL = new URL(`https://www.googleapis.com/upload/drive/v3/files/${id}`);
    requestURL.search = new URLSearchParams({
      access_token: accessToken,
      uploadType: 'multipart',
    }).toString();
    const response = await fetch(requestURL.toString(), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${MULTIPART_RELATED_BOUNDARY}`,
      },
      body: `--${MULTIPART_RELATED_BOUNDARY}\r
Content-Type: application/json; charset=UTF-8\r
\r
${JSON.stringify({
  modifiedTime: modifiedTime.toISOString(),
})}\r
--${MULTIPART_RELATED_BOUNDARY}\r
Content-Type: text/plain; charset=UTF-8\r
\r
${content}\r
--${MULTIPART_RELATED_BOUNDARY}--`,
    });
    if (response.ok) {
      return;
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },
};

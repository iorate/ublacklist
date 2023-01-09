import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import * as S from 'microstruct';
import { Cloud } from '../types';
import { HTTPError, UnexpectedResponse } from '../utilities';
import * as Helpers from './helpers';

dayjs.extend(dayjsUTC);

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const APP_KEY = process.env.DROPBOX_API_KEY!;
const APP_SECRET = process.env.DROPBOX_API_SECRET!;
/* eslint-enable */

function toISOStringSecond(time: dayjs.Dayjs): string {
  return time.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
}

export const dropbox: Cloud = {
  hostPermissions: [],

  messageNames: {
    sync: 'clouds_dropboxSync',
    syncDescription: 'clouds_dropboxSyncDescription',
    syncTurnedOn: 'clouds_dropboxSyncTurnedOn',
  },

  modifiedTimePrecision: 'second',

  shouldUseAltFlow: Helpers.shouldUseAltFlow(),

  // https://www.dropbox.com/developers/documentation/http/documentation
  authorize: Helpers.authorize('https://www.dropbox.com/oauth2/authorize', {
    client_id: APP_KEY,
    token_access_type: 'offline',
    force_reapprove: 'true',
  }),

  getAccessToken: Helpers.getAccessToken('https://api.dropboxapi.com/oauth2/token', {
    client_id: APP_KEY,
    client_secret: APP_SECRET,
  }),

  refreshAccessToken: Helpers.refreshAccessToken('https://api.dropboxapi.com/oauth2/token', {
    client_id: APP_KEY,
    client_secret: APP_SECRET,
  }),

  // https://www.dropbox.com/developers/documentation/http/documentation#files-upload
  async createFile(
    accessToken: string,
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const urlBuilder = new URL('https://content.dropboxapi.com/2/files/upload');
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
      arg: JSON.stringify({
        path: `/${filename}`,
        mode: 'add',
        autorename: false,
        client_modified: toISOStringSecond(modifiedTime),
        mute: true,
        strict_conflict: false,
      }),
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=dropbox-cors-hack',
      },
      body: content,
    });
    if (response.ok) {
      return;
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },

  // https://www.dropbox.com/developers/documentation/http/documentation#files-get_metadata
  async findFile(
    accessToken: string,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const urlBuilder = new URL('https://api.dropboxapi.com/2/files/get_metadata');
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=dropbox-cors-hack',
      },
      body: JSON.stringify({
        path: `/${filename}`,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false,
      }),
    });
    if (response.ok) {
      const responseBody: unknown = await response.json();
      if (!S.is(responseBody, S.type({ id: S.string(), client_modified: S.string() }))) {
        throw new UnexpectedResponse(responseBody);
      }
      return { id: responseBody.id, modifiedTime: dayjs(responseBody.client_modified) };
    } else if (response.status === 409) {
      const responseBody: unknown = await response.json();
      if (
        !S.is(
          responseBody,
          S.type({
            error: S.type({
              '.tag': S.literal('path'),
              path: S.type({ '.tag': S.string() }),
            }),
          }),
        )
      ) {
        throw new UnexpectedResponse(responseBody);
      }
      if (responseBody.error.path['.tag'] === 'not_found') {
        return null;
      } else {
        throw new Error(responseBody.error['.tag']);
      }
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },

  // https://www.dropbox.com/developers/documentation/http/documentation#files-download
  async readFile(accessToken: string, id: string): Promise<{ content: string }> {
    const urlBuilder = new URL('https://content.dropboxapi.com/2/files/download');
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
      arg: JSON.stringify({
        path: id,
      }),
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: 'POST',
    });
    if (response.ok) {
      const responseBody = await response.text();
      return { content: responseBody };
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },

  // https://www.dropbox.com/developers/documentation/http/documentation#files-upload
  async writeFile(
    accessToken: string,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const urlBuilder = new URL('https://content.dropboxapi.com/2/files/upload');
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
      arg: JSON.stringify({
        path: id,
        mode: 'overwrite',
        autorename: false,
        client_modified: toISOStringSecond(modifiedTime),
        mute: true,
        strict_conflict: false,
      }),
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=dropbox-cors-hack',
      },
      body: content,
    });
    if (response.ok) {
      return;
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  },
};

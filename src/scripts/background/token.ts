import dayjs from 'dayjs';
import { apis } from '../apis';
import * as LocalStorage from '../local-storage';
import { Mutex } from '../utilities';

// #if BROWSER === 'chrome'
const OAUTH2_CLIENT_ID = '304167046827-aqukv3fe891j0f9cu94i5aljhsecgpen.apps.googleusercontent.com';
// #else
const OAUTH2_CLIENT_ID = '304167046827-a53p7d9jopn9nvbo7e183t966rfcp9d1.apps.googleusercontent.com';
// #endif
const OAUTH2_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const mutex = new Mutex();

export async function requestToken(interactive: boolean): Promise<string> {
  // #if BROWSER === 'chrome'
  try {
    // #endif
    return await mutex.lock(async () => {
      const { tokenCache } = await LocalStorage.load('tokenCache');
      if (tokenCache && dayjs().isBefore(dayjs(tokenCache.expirationDate))) {
        return tokenCache.token;
      }
      const authURL =
        'https://accounts.google.com/o/oauth2/auth' +
        `?client_id=${OAUTH2_CLIENT_ID}` +
        '&response_type=token' +
        `&redirect_uri=${encodeURIComponent(apis.identity.getRedirectURL())}` +
        `&scope=${encodeURIComponent(OAUTH2_SCOPE)}`;
      const redirectURL = await apis.identity.launchWebAuthFlow({ interactive, url: authURL });
      const params = new URLSearchParams(new URL(redirectURL).hash.slice(1));
      if (params.has('error')) {
        throw new Error(params.get('error')!);
      }
      const token = params.get('access_token')!;
      const expirationDate = dayjs()
        .add(Number(params.get('expires_in')!), 'second')
        .toISOString();
      await LocalStorage.store({ tokenCache: { token, expirationDate } });
      return token;
    });
    // #if BROWSER === 'chrome'
  } catch (e) {
    if (interactive) {
      throw e;
    }
    try {
      return await apis.identity.getAuthToken({ interactive: false });
    } catch {
      throw e;
    }
  }
  // #endif
}

export async function clearTokenCache(): Promise<void> {
  await mutex.lock(async () => {
    await LocalStorage.store({ tokenCache: null });
  });
}

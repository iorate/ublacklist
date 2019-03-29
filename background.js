window.accessToken = null;
window.accessTokenExpDate = null;

const SYNC_INTERVAL = 5;
const SYNC_FILENAME = 'uBlacklist.txt'

class GApiRequestError extends Error {
  constructor(reason) {
    super(reason.result.error.message);
    this.status = reason.status;
  }
}

class SyncService {
  constructor() {
    this.intervalId = null;
    (async () => {
      const {sync} = await getLocalStorage({sync: false});
      if (sync) {
        this.start();
      }
    })();
  }

  start() {
    this.sync();
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.sync();
      }, SYNC_INTERVAL * 60 * 1000);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async sync() {
    const {blacklist, timestamp} = await getLocalStorage({
      blacklist: '',
      timestamp: new Date(0).toISOString()
    });
    const token = await getAuthToken({interactive: false});
    try {
      await this.syncFile(blacklist, timestamp, token);
    } catch (e) {
      if (e instanceof GApiRequestError && e.status == 401) {
        await removeCachedAuthToken({token});
        return;
      }
      throw e;
    }
  }

  async syncFile(localBlacklist, localTimestamp, token) {
    let fileInfo = await this.findFile(token);
    if (fileInfo) {
      const cloudTimestamp = fileInfo.modifiedTime;
      const timestampDiff = new Date(localTimestamp).getTime() - new Date(cloudTimestamp).getTime();
      if (timestampDiff < 0) {
        const cloudBlacklist = await this.downloadFile(fileInfo, token);
        await setLocalStorage({ blacklist: cloudBlacklist, timestamp: cloudTimestamp });
      } else if (timestampDiff > 0) {
        await this.uploadFile(fileInfo, localBlacklist, localTimestamp, token);
      }
    } else {
      fileInfo = await this.createFile(token);
      await this.uploadFile(fileInfo, localBlacklist, localTimestamp, token);
    }
  }

  async findFile(token) {
    const response = await this.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        corpora: 'user',
        q: `name = '${SYNC_FILENAME}' and 'root' in parents and trashed = false`,
        spaces: 'drive',
        fields: 'files(id, modifiedTime)'
      }
    }, token);
    return response.result.files.length ? response.result.files[0] : null;
  }

  async downloadFile(fileInfo, token) {
    const response = await this.request({
      path: `/drive/v3/files/${fileInfo.id}`,
      method: 'GET',
      params: {
        alt: 'media'
      }
    }, token);
    return response.body;
  }

  async uploadFile(fileInfo, localBlacklist, localTimestamp, token) {
    await this.request({
      path: `/upload/drive/v3/files/${fileInfo.id}`,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: localBlacklist
    }, token);
    await this.request({
      path: `/drive/v3/files/${fileInfo.id}`,
      method: 'PATCH',
      body: {
        modifiedTime: localTimestamp
      }
    }, token);
  }

  async createFile(token) {
    const response = await this.request({
      path: '/drive/v3/files',
      method: 'POST',
      body: {
        name: SYNC_FILENAME
      }
    }, token);
    return response.result;
  }

  async request(args, token) {
    const uri = new URL(`https://www.googleapis.com${args.path}`);
    if (args.params) {
      uri.search = new URLSearchParams(args.params).toString();
    }
    const init = {
      method: args.method,
      headers: new Headers({Authorization: `Bearer ${token}`})
    };
    if (args.body) {
      if (typeof args.body == 'object') {
        init.headers.append('Content-Type', 'application/json');
        init.body = JSON.stringify(args.body);
      } else {
        init.body = args.body;
      }
    }
    const response = await fetch(uri, init);
    const result = await response.clone().json().catch(() => false);
    const responseOrReason = {
      result,
      body: await response.text(),
      status: response.status
    };
    if (response.ok) {
      return responseOrReason;
    } else {
      throw new GApiRequestError(responseOrReason);
    }
  }
}

const syncService = new SyncService();

chrome.runtime.onMessage.addListener(async () => {
  const {sync} = await getLocalStorage({sync: false});
  if (sync) {
    syncService.start();
  } else {
    syncService.stop();
  }
});

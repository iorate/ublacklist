chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'update') {
    const [x] = details.previousVersion.split('.').map(Number);
    if (x <= 1) {
      chrome.storage.sync.clear();
    }
  }
});

const SYNC_INTERVAL = 5;

class GApiRequestError extends Error {
  constructor(reason) {
    super(`${reason.status} ${reason.statusText}`);
    Error.captureStackTrace(this, GApiRequestError);
    this.reason = reason;
  }
}

class SyncService {
  constructor() {
    this.intervalId = null;
    (async () => {
      const { sync } = await getLocalStorage({ sync: false });
      if (sync) {
        this.start();
      }
    })().catch(e => {
      console.error(e);
    });
  }

  start() {
    const callSync = () => {
      this.sync().catch(e => {
        console.error(e);
      });
    };
    callSync();
    if (!this.intervalId) {
      this.intervalId = setInterval(callSync, SYNC_INTERVAL * 60 * 1000);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async sync() {
    const { blacklist, timestamp } = await getLocalStorage({
      blacklist: '',
      timestamp: new Date(0).toISOString()
    });
    await this.loadGApiClient();
    const token = await getAuthToken({ interactive: false });
    gapi.auth.setToken({ access_token: token });
    try {
      await this.syncFile(blacklist, timestamp);
    } catch(e) {
      if (e instanceof GApiRequestError && e.reason.status == 401) {
        await removeCachedAuthToken({ token });
        return;
      }
      throw e;
    }
  }

  loadGApiClient() {
    return new Promise((resolve, reject) => {
      if (window.gapi && gapi.client) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.addEventListener('load', () => {
        gapi.load('client', {
          callback() {
            resolve();
          },
          onerror() {
            reject(new Error('The Google API client failed to load.'));
          }
        });
      });
      script.addEventListener('error', event => {
        reject(event.error);
      });
      setTimeout(() => {
        reject(new Error('The Google API client took too long to load.'));
      }, 1 * 60 * 1000);
      document.body.appendChild(script);
      document.body.removeChild(script);
    });
  }

  async syncFile(localBlacklist, localTimestamp) {
    let fileInfo = await this.findFile();
    if (fileInfo) {
      const cloudTimestamp = fileInfo.modifiedTime;
      const timestampDiff = new Date(localTimestamp).getTime() - new Date(cloudTimestamp).getTime();
      if (timestampDiff < 0) {
        const cloudBlacklist = await this.downloadFile(fileInfo);
        await setLocalStorage({ blacklist: cloudBlacklist, timestamp: cloudTimestamp });
      } else if (timestampDiff > 0) {
        await this.uploadFile(fileInfo, localBlacklist, localTimestamp);
      }
    } else {
      if (!new Date(localTimestamp).getTime()) {
        localTimestamp = new Date().toISOString();
        await setLocalStorage({ timestamp: localTimestamp });
      }
      fileInfo = await this.createFile();
      await this.uploadFile(fileInfo, localBlacklist, localTimestamp);
    }
  }

  async findFile() {
    const response = await this.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        corpora: 'user',
        q: `name = 'uBlacklist.txt' and 'root' in parents and trashed = false`,
        spaces: 'drive',
        fields: 'files(id, modifiedTime)'
      }
    });
    return response.result.files.length ? response.result.files[0] : null;
  }

  async downloadFile(fileInfo) {
    const response = await this.request({
      path: `/drive/v3/files/${fileInfo.id}`,
      method: 'GET',
      params: {
        alt: 'media'
      }
    });
    return response.body;
  }

  async uploadFile(fileInfo, localBlacklist, localTimestamp) {
    await this.request({
      path: `/upload/drive/v3/files/${fileInfo.id}`,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: localBlacklist
    });
    await this.request({
      path: `/drive/v3/files/${fileInfo.id}`,
      method: 'PATCH',
      body: {
        modifiedTime: localTimestamp
      }
    });
  }

  async createFile() {
    const response = await this.request({
      path: '/drive/v3/files',
      method: 'POST',
      body: {
        name: 'uBlacklist.txt'
      }
    });
    return response.result;
  }

  async request(args) {
    try {
      return await gapi.client.request(args);
    } catch (reason) {
      throw new GApiRequestError(reason);
    }
  }
}

const syncService = new SyncService();

chrome.runtime.onMessage.addListener(() => {
  (async () => {
    const { sync } = await getLocalStorage({ sync: false });
    if (sync) {
      syncService.start();
    } else {
      syncService.stop();
    }
  })().catch(e => {
    console.error(e);
  });
});

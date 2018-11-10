chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'update') {
    chrome.storage.sync.clear();
  }
});

const SYNC_INTERVAL = 5;

class SyncService {
  constructor() {
    this.intervalId = null;
    (async () => {
      const { blacklist, timestamp, sync } = await getLocalStorage(null);
      if (sync) {
        this.start();
        await this.sync(blacklist, timestamp);
      }
    })().catch(e => {
      console.error(e);
    });
  }

  start() {
    if (this.intervalId) {
      return;
    }
    this.intervalId = setInterval(() => {
      (async () => {
        const { blacklist, timestamp } = await getLocalStorage({
          blacklist: '',
          timestamp: new Date(0).toISOString()
        });
        await this.sync(blacklist, timestamp);
      })().catch(e => {
        console.error(e);
      });
    }, SYNC_INTERVAL * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async sync(localBlacklist, localTimestamp) {
    await this.loadGApiClient();
    const token = await getAuthToken({ interactive: false });
    gapi.auth.setToken({ access_token: token });
    await this.syncFile(localBlacklist, localTimestamp).catch(e => {
      if (e.status == 401) {
        chrome.identity.removeCachedAuthToken(token);
        return;
      }
      throw reason;
    });
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
        gapi.load('client', () => {
          resolve();
        });
      });
      script.addEventListener('error', event => {
        reject(event.error);
      });
      setTimeout(() => {
        reject(new Error('Google API Client Libraries took too long to load.'));
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
      fileInfo = await this.createFile();
      await this.uploadFile(fileInfo, localBlacklist, localTimestamp);
    }
  }

  async findFile() {
    const response = await gapi.client.request({
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
    const response = await gapi.client.request({
      path: `/drive/v3/files/${fileInfo.id}`,
      method: 'GET',
      params: {
        alt: 'media'
      }
    });
    return response.body;
  }

  async uploadFile(fileInfo, localBlacklist, localTimestamp) {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileInfo.id}`,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: localBlacklist
    });
    await gapi.client.request({
      path: `/drive/v3/files/${fileInfo.id}`,
      method: 'PATCH',
      body: {
        modifiedTime: localTimestamp
      }
    });
  }

  async createFile() {
    const response = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      body: {
        name: 'uBlacklist.txt'
      }
    });
    return response.result;
  }
}

const syncService = new SyncService();

chrome.runtime.onMessage.addListener(message => {
  (async () => {
    const { blacklist, timestamp, sync } = await getLocalStorage(null);
    if (sync) {
      syncService.start();
      if (message.immediate) {
        await syncService.sync(blacklist, timestamp);
      }
    } else {
      syncService.stop();
    }
  })().catch(e => {
    console.error(e);
  });
});

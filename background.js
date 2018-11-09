chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'update') {
    chrome.storage.sync.clear();
  }
});

const SYNC_INTERVAL = 60;

class SyncService {
  constructor() {
    this.intervalId = null;
    this.start();
  }

  start() {
    chrome.storage.local.get({
      enableSync: false
    }, items => {
      if (items.enableSync) {
        if (this.intervalId) {
          return;
        }
        this.loadApiClient();
        this.intervalId = setInterval(() => {
          this.loadApiClient();
        }, SYNC_INTERVAL * 1000);
      } else if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });
  }

  loadApiClient() {
    if (window.gapi && gapi.client) {
      this.loadAccessToken();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.addEventListener('load', () => {
      gapi.load('client', () => {
        this.loadAccessToken();
      });
    });
    document.body.appendChild(script);
    document.body.removeChild(script);
  }

  loadAccessToken() {
    chrome.identity.getAuthToken({
      interactive: false
    }, token => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      gapi.auth.setToken({ access_token: token });
      this.loadBlacklist(token);
    });
  }

  loadBlacklist(token) {
    chrome.storage.local.get({
      blacklist: '',
      timestamp: new Date(0).toISOString()
    }, items => {
      this.sync(items.blacklist, items.timestamp).catch(reason => {
        if (reason.status == 401) {
          chrome.identity.removeCachedAuthToken(token);
        } else {
          console.error(reason);
        }
      });
    });
  }

  async sync(localBlacklist, localTimestamp) {
    let file = await this.find();
    if (file) {
      const cloudTimestamp = file.modifiedTime;
      const timestampDiff = new Date(localTimestamp).getTime() - new Date(cloudTimestamp).getTime();
      if (timestampDiff < 0) {
        const cloudBlacklist = await this.download(file);
        chrome.storage.local.set({
          blacklist: cloudBlacklist,
          timestamp: cloudTimestamp
        });
      } else if (timestampDiff > 0) {
        await this.upload(file, localBlacklist, localTimestamp);
      }
    } else {
      file = await this.create();
      await this.upload(file, localBlacklist, localTimestamp);
    }
  }

  async find() {
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

  async download(file) {
    const response = await gapi.client.request({
      path: `/drive/v3/files/${file.id}`,
      method: 'GET',
      params: {
        alt: 'media'
      }
    });
    return response.body;
  }

  async upload(file, localBlacklist, localTimestamp) {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${file.id}`,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: localBlacklist
    });
    await gapi.client.request({
      path: `/drive/v3/files/${file.id}`,
      method: 'PATCH',
      body: {
        modifiedTime: localTimestamp,
      }
    });
  }

  async create() {
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

chrome.runtime.onMessage.addListener(request => {
  if (request == 'restart') {
    syncService.start();
  }
});

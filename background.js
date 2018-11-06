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
        this.intervalId = window.setInterval(() => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/client.js';
          script.addEventListener('load', () => {
            this.sync();
          });
          document.body.appendChild(script);
          document.body.removeChild(script);
        }, SYNC_INTERVAL * 1000);
      } else if (this.intervalId) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });
  }

  sync() {
  }
}

const syncService = new SyncService();

chrome.runtime.onMessage.addListener(request => {
  if (request == 'restart') {
    syncService.start();
  }
});

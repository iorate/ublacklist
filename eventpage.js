chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'update') {
    const v = details.previousVersion.split('.').map(Number);
    if (v[0] < 1 || v[0] == 1 && (v[1] < 2 || v[1] == 2 && v[2] < 3)) {
      // previousVersion < 1.2.3
      chrome.storage.sync.get('blacklist', options => {
        if ('blacklist' in options) {
          chrome.storage.local.set(options);
        }
      });
    }
  }
});

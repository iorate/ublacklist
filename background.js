chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == 'update') {
    const [x, y = 0, z = 0] = details.previousVersion.split('.').map(Number);
    if (x < 1 || x == 1 && (y < 2 || y == 2 && z < 3)) {
      chrome.storage.sync.clear();
    }
  }
});

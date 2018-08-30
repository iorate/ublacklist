class UBlacklistOptions {
  constructor() {
    for (const element of document.querySelectorAll('[data-translate]')) {
      element.textContent = chrome.i18n.getMessage(element.dataset.translate);
    }

    chrome.storage.local.get({ blacklist: '' }, options => {
      this.onBlacklistLoaded(options.blacklist);
    });

    document.getElementById('save').addEventListener('click', () => {
      this.onSaveButtonClicked();
    });
  }

  onBlacklistLoaded(blacklist) {
    document.getElementById('blacklist').value = blacklist;
  }

  onSaveButtonClicked() {
    chrome.storage.local.set({ blacklist: document.getElementById('blacklist').value }, () => {
      const saveStatus = document.getElementById('saveStatus');
      saveStatus.style.display = 'inline';
      setTimeout(() => {
        saveStatus.style.display = 'none';
      }, 1000);
    });
  }
}

new UBlacklistOptions();

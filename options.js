chrome.storage.sync.get({
  blacklist: ''
}, options => {
  for (const element of document.querySelectorAll('[data-translate]')) {
    element.textContent = chrome.i18n.getMessage(element.dataset.translate);
  }

  const blacklist = document.getElementById('blacklist');

  blacklist.value = options.blacklist;

  document.getElementById('save').addEventListener('click', () => {
    options.blacklist = blacklist.value;

    chrome.storage.sync.set(options, () => {
      const saveStatus = document.getElementById('save-status');
      saveStatus.style.display = 'inline';
      setTimeout(() => {
        saveStatus.style.display = 'none';
      }, 1000);
    });
  });
});

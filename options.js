chrome.storage.local.get({ blacklist: '' }, options => {
  for (const element of document.querySelectorAll('[data-translate]')) {
    element.insertAdjacentHTML('beforeend', chrome.i18n.getMessage(element.dataset.translate));
  }
  document.getElementById('blacklist').value = options.blacklist;
  document.getElementById('save').addEventListener('click', () => {
    chrome.storage.local.set({ blacklist: document.getElementById('blacklist').value }, () => {
      const saveStatus = document.getElementById('saveStatus');
      saveStatus.style.display = 'inline';
      setTimeout(() => {
        saveStatus.style.display = 'none';
      }, 1000);
    });
  });
});

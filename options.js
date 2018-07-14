chrome.storage.sync.get({
  blacklist: ''
}, options => {
  for (let element of document.querySelectorAll('[data-translate]')) {
    element.textContent = chrome.i18n.getMessage(element.dataset.translate);
  }

  const blacklist = document.getElementById('blacklist');
  const save = document.getElementById('save');
  const saveStatus = document.getElementById('save-status');

  blacklist.value = options.blacklist;

  save.addEventListener('click', () => {
    options.blacklist = blacklist.value;

    chrome.storage.sync.set(options, () => {
      saveStatus.style.display = 'inline';
      setTimeout(() => {
        saveStatus.style.display = 'none';
      }, 1000);
    });
  });
});

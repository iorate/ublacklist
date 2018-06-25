chrome.storage.sync.get({
  blacklist: ''
}, items => {
  for (let element of document.querySelectorAll('[data-translate]')) {
    element.textContent = chrome.i18n.getMessage(element.dataset.translate);
  }

  const blacklist = document.getElementById('blacklist');
  const save = document.getElementById('save');
  const saveStatus = document.getElementById('save-status');

  blacklist.value = items.blacklist;

  save.addEventListener('click', () => {
    chrome.storage.sync.set({
      blacklist: blacklist.value
    }, () => {
      saveStatus.style.display = 'inline';
      setTimeout(() => {
        saveStatus.style.display = 'none';
      }, 1000);
    });
  }, false);
});

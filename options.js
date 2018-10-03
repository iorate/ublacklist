chrome.storage.local.get({ blacklist: '' }, options => {
  for (const element of document.querySelectorAll('[data-translate]')) {
    element.insertAdjacentHTML('beforeend', chrome.i18n.getMessage(element.dataset.translate));
  }

  const blacklistInput = document.getElementById('blacklistInput');
  const saveButton = document.getElementById('saveButton');
  const saveStatusSpan = document.getElementById('saveStatusSpan');

  blacklistInput.value = options.blacklist;

  saveButton.addEventListener('click', () => {
    chrome.storage.local.set({ blacklist: blacklistInput.value }, () => {
      saveStatusSpan.style.display = 'inline';
      setTimeout(() => {
        saveStatusSpan.style.display = 'none';
      }, 1000);
    });
  });
});

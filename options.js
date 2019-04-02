for (const element of document.querySelectorAll('[data-i18n]')) {
  element.insertAdjacentHTML('beforeend', _(element.dataset.i18n));
}

(async () => {
  let {blacklist, timestamp, sync, hideBlockLinks} = await getLocalStorage({
    blacklist: '',
    timestamp: new Date(0).toISOString(),
    sync: false,
    hideBlockLinks: false
  });

  const blacklistTextArea = $('blacklistTextArea');
  const importTextArea = $('importTextArea');

  blacklistTextArea.value = blacklist;
  $('syncCheckBox').checked = sync;
  $('hideBlockLinksCheckBox').checked = hideBlockLinks;

  $('importButton').addEventListener('click', () => {
    blacklistTextArea.value = unlines([
      ...lines(blacklistTextArea.value),
      ...lines(importTextArea.value).filter(s => /^[^/*]+$/.test(s)).map(s => `*://*.${s}/*`)
    ]);
    blacklistTextArea.scrollTop = blacklistTextArea.scrollHeight;
    importTextArea.value = '';
  });

  $('permitButton').addEventListener('click', async () => {
    try {
      await getAuthToken({interactive: true});
      $('permitStatus').textContent = _('permitted');
    } catch (e) {
      $('permitStatus').textContent = _('notPermitted');
    }
  });

  $('saveButton').addEventListener('click', async () => {
    timestamp = blacklistTextArea.value != blacklist ? new Date().toISOString() : timestamp;
    blacklist = blacklistTextArea.value;
    sync = $('syncCheckBox').checked;
    hideBlockLinks = $('hideBlockLinksCheckBox').checked;
    await setLocalStorage({blacklist, timestamp, sync, hideBlockLinks});
    chrome.runtime.sendMessage({});
  });
})();

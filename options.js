chrome.storage.local.get({ blacklist: '' }, items => {
  document.body.insertAdjacentHTML('beforeend', `
    <p>
      ${_('blacklist')}<br>
      <small>${_('blacklistDescription')}</small><br>
      <small>${_('example')}: *://*.example.com/*</small><br>
      <small>${_('example')}: /example\.(net|org)/</small><br>
      <textarea id="blacklistTextarea" cols="80" rows="8" spellcheck="false"></textarea>
    </p>
    <p>
      <button id="saveButton">${_('save')}</button>
      <span id="saveStatusSpan" style="display:none">${_('saveStatus')}</span>
    </p>
  `);
  const blacklistTextarea = document.getElementById('blacklistTextarea');
  blacklistTextarea.value = items.blacklist;
  document.getElementById('saveButton').addEventListener('click', () => {
    chrome.storage.local.set({ blacklist: blacklistTextarea.value }, () => {
      const saveStatusSpan = document.getElementById('saveStatusSpan');
      saveStatusSpan.style.display = 'inline';
      setTimeout(() => {
        saveStatusSpan.style.display = 'none';
      }, 1000);
    });
  });
});

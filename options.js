chrome.storage.local.get({ blacklist: '' }, options => {
  document.body.insertAdjacentHTML('beforeend', `
    <p>
      ${_('blacklist')}<br>
      <small>${_('blacklistDescription')}</small><br>
      <small>${_('example')}: *://*.example.com/*</small><br>
      <small>${_('example')}: /example\.(net|org)/</small><br>
      <textarea id="blacklistInput" cols="80" rows="8" spellcheck="false"></textarea>
    </p>
    <p>
      <button id="saveButton">${_('save')}</button>
      <span id="saveStatusSpan" style="display:none">${_('saveStatus')}</span>
    </p>
  `);

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

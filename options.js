chrome.storage.local.get({
  blacklist: '',
  enableSync: false
}, items => {
  document.body.insertAdjacentHTML('beforeend', String.raw`
    <div>${_('blacklist')}</div>
    <div class="description">
      ${_('blacklistDescription')}<br>
      ${_('example')}: *://*.example.com/*<br>
      ${_('example')}: /example\.(net|org)/
    </div>
    <div><textarea id="blacklistTextArea" spellcheck="false"></textarea></div>
    <div>
      <details>
        <summary>${_('importFromPersonalBlocklist')}</summary>
        <div class="container">
          <div class="description">${_('importDescription')}</div>
          <div><textarea id="importTextArea" spellcheck="false"></textarea></div>
          <div><button id="importButton">${_('import')}</button></div>
        </div>
      </details>
    </div>
    <div>
      <details>
        <summary>${_('syncWithGoogleDrive')}</summary>
        <div class="container">
          <div class="description">${_('syncDescription')}</div>
          <hr>
          <div class="description">${_('googleDriveDescription')}</div>
          <div>
            <button id="googleDriveButton">${_('confirm')}</button>
            <span id="googleDriveStatus"></span>
          </div>
          <hr>
          <div class="description">${_('googleApisDescription')}</div>
          <div>
            <button id="googleApisButton">${_('confirm')}</button>
            <span id="googleApisStatus"></span>
          </div>
          <hr>
          <div>
            <input id="enableSyncCheckBox" type="checkbox">
            <label for="enableSyncCheckBox">${_('enableSync')}</label>
          </div>
        </div>
    </div>
    <div><button id="okButton">${_('ok')}</button></div>
  `);

  const blacklistTextArea = $('blacklistTextArea');
  const importTextArea = $('importTextArea');

  blacklistTextArea.value = items.blacklist;
  $('enableSyncCheckBox').checked = items.enableSync;

  $('importButton').addEventListener('click', () => {
    blacklistTextArea.value = unlines(
      lines(blacklistTextArea.value).concat(
        lines(importTextArea.value).filter(s => /^[^/*]+$/.test(s)).map(s => '*://*.' + s + '/*')
      )
    );
    blacklistTextArea.scrollTop = blacklistTextArea.scrollHeight;
    importTextArea.value = '';
  });

  $('googleDriveButton').addEventListener('click', () => {
    chrome.identity.getAuthToken({
      interactive: true
    }, token => {
      $('googleDriveStatus').textContent = token ? _('permitted') : _('notPermitted');
    });
  });

  $('googleApisButton').addEventListener('click', () => {
    chrome.permissions.request({
      origins: ['https://www.googleapis.com/']
    }, granted => {
      $('googleApisStatus').textContent = granted ? _('permitted') : _('notPermitted');
    });
  });

  $('okButton').addEventListener('click', () => {
    chrome.storage.local.set({
      blacklist: blacklistTextArea.value,
      enableSync: $('enableSyncCheckBox').checked
    }, () => {
      chrome.runtime.sendMessage('restart');
      window.close();
    });
  });
});

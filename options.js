chrome.storage.local.get({
  blacklist: '',
  timestamp: new Date(0).toISOString(),
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
          <div class="description">${_('permitDescription')}</div>
          <div>
            <button id="permitButton">${_('permit')}</button>
            <span id="permitStatus"></span>
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

  $('permitButton').addEventListener('click', () => {
    chrome.identity.getAuthToken({
      interactive: true
    }, token => {
      $('permitStatus').textContent = token ? _('permitted') : _('notPermitted');
    });
  });

  $('okButton').addEventListener('click', () => {
    chrome.storage.local.set({
      blacklist: blacklistTextArea.value,
      timestamp: items.blacklist == blacklistTextArea.value ? items.timestamp : new Date().toISOString(),
      enableSync: $('enableSyncCheckBox').checked
    }, () => {
      chrome.runtime.sendMessage('restart');
      window.close();
    });
  });
});

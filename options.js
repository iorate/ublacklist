chrome.storage.local.get({
  blacklist: '',
  enableSync: false
}, items => {
  document.body.insertAdjacentHTML('beforeend', String.raw`
    <div>${_('blacklist')}</div>
    <div>${_('blacklistDescription')}</div>
    <div>${_('example')}: *://*.example.com/*</div>
    <div>${_('example')}: /example\.(net|org)/</div>
    <div><textarea id="blacklistTextArea" spellcheck="false"></textarea></div>
    <div>
      <details>
        <summary>${_('importFromPersonalBlocklist')}</summary>
        <div class="container">
          <div>${_('importDescription')}</div>
          <div><textarea id="importTextArea" spellcheck="false"></textarea></div>
          <div><button id="importButton">${_('import')}</button></div>
        </div>
      </details>
    </div>
    <div>
      <details>
        <summary>${_('syncWithGoogleDrive')}</summary>
        <div class="container">
          <div>
            <input id="enableSyncCheckBox" type="checkbox">
            <label for="enableSyncCheckBox">${_('enableSync')}</label>
          </div>
          <div>${_('syncDescription')}</div>
        </div>
    </div>
    <div><button id="okButton">${_('ok')}</button></div>
  `);

  const blacklistTextArea = document.getElementById('blacklistTextArea');
  const importTextArea = document.getElementById('importTextArea');
  const enableSyncCheckBox = document.getElementById('enableSyncCheckBox');

  blacklistTextArea.value = items.blacklist;
  enableSyncCheckBox.checked = items.enableSync;

  document.getElementById('importButton').addEventListener('click', () => {
    blacklistTextArea.value = unlines(
      lines(blacklistTextArea.value).concat(
        lines(importTextArea.value).filter(s => /^[^/*]+$/.test(s)).map(s => '*://*.' + s + '/*')
      )
    );
    blacklistTextArea.scrollTop = blacklistTextArea.scrollHeight;
    importTextArea.value = '';
  });

  enableSyncCheckBox.addEventListener('change', () => {
    if (enableSyncCheckBox.checked) {
      chrome.identity.getAuthToken({
        interactive: true
      }, token => {
        if (chrome.runtime.lastError) {
          enableSyncCheckBox.checked = false;
          return;
        }
      });
    }
  });

  document.getElementById('okButton').addEventListener('click', () => {
    chrome.storage.local.set({
      blacklist: blacklistTextArea.value,
      enableSync: enableSyncCheckBox.checked
    }, () => {
      chrome.runtime.sendMessage('restart');
      window.close();
    });
  });
});

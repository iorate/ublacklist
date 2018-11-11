(async () => {
  const { blacklist, timestamp, sync } = await getLocalStorage({
    blacklist: '',
    timestamp: new Date(0).toISOString(),
    sync: false
  });
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
          <div class="description">${_('enableSyncDescription')}</div>
          <div>
            <input id="syncCheckBox" type="checkbox">
            <label for="syncCheckBox">${_('enableSync')}</label>
          </div>
        </div>
    </div>
    <div><button id="okButton">${_('ok')}</button></div>
  `);

  const blacklistTextArea = $('blacklistTextArea');
  const importTextArea = $('importTextArea');

  blacklistTextArea.value = blacklist;
  $('syncCheckBox').checked = sync;

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
    (async () => {
      await getAuthToken({ interactive: true });
      $('permitStatus').textContent = _('permitted');
    })().catch(() => {
      $('permitStatus').textContent = _('notPermitted');
    });
  });

  $('okButton').addEventListener('click', () => {
    (async () => {
      await setLocalStorage({
        blacklist: blacklistTextArea.value,
        timestamp: blacklistTextArea.value != blacklist ? new Date().toISOString() : timestamp,
        sync: $('syncCheckBox').checked
      });
      chrome.runtime.sendMessage({});
      window.close();
    })().catch(e => {
      console.error(e);
    });
  });
})().catch(e => {
  console.error(e);
});

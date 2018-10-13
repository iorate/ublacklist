chrome.storage.local.get({ blacklist: '' }, items => {
  document.body.insertAdjacentHTML('beforeend', String.raw`
    <div>${_('blacklist')}</div>
    <div class="small">${_('blacklistDescription')}</div>
    <div class="small">${_('example')}: *://*.example.com/*</div>
    <div class="small">${_('example')}: /example\.(net|org)/</div>
    <div><textarea id="blacklistTextArea" spellcheck="false"></textarea></div>
    <div>
      <details>
        <summary>${_('importFromPersonalBlocklist')}</summary>
        <div id="importContainer">
          <div class="small">${_('importDescription')}</div>
          <div><textarea id="importTextArea" spellcheck="false"></textarea></div>
          <div><button id="importButton">${_('import')}</button></div>
        </div>
      </details>
    </div>
    <div><button id="okButton">${_('ok')}</button></div>
  `);

  const blacklistTextArea = document.getElementById('blacklistTextArea');
  const importTextArea = document.getElementById('importTextArea');

  blacklistTextArea.value = items.blacklist;

  document.getElementById('importButton').addEventListener('click', () => {
    blacklistTextArea.value = unlines(
      lines(blacklistTextArea.value).concat(
        lines(importTextArea.value).filter(s => /^[^/*]+$/.test(s)).map(s => '*://*.' + s + '/*')
      )
    );
    blacklistTextArea.scrollTop = blacklistTextArea.scrollHeight;
    importTextArea.value = '';
  });

  document.getElementById('okButton').addEventListener('click', () => {
    chrome.storage.local.set({ blacklist: blacklistTextArea.value });
    window.close();
  });
});

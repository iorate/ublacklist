loadBlockRules(blockRules => {
  chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
    const url = activeTabs[0].url;
    if (!/^(https?|ftp):$/.test(new URL(url).protocol) ||
        !blockRules.some(rule => rule.compiled && rule.compiled.test(url))) {
      document.body.insertAdjacentHTML('beforeend', String.raw`
        <form id="ubBlockForm">
          <label>
            ${_('blockThisSite')}:
            <input id="ubBlockInput" type="text" autofocus spellcheck="false">
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      `);
      $('ubBlockInput').value = makeMatchPattern(url) || '';
      $('ubBlockForm').addEventListener('submit', event => {
        event.preventDefault();
        const raw = $('ubBlockInput').value;
        const compiled = compileBlockRule(raw);
        if (compiled) {
          blockRules.push({ raw, compiled });
          saveBlockRules(blockRules);
        }
        window.close();
      });
    } else {
      document.body.insertAdjacentHTML('beforeend', String.raw`
        <form id="ubUnblockForm">
          <label>
            ${_('unblockThisSite')}:
            <select id="ubUnblockSelect" autofocus>
            </select>
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      `);
      blockRules.forEach((rule, index) => {
        if (rule.compiled && rule.compiled.test(url)) {
          const option = document.createElement('option');
          option.textContent = rule.raw;
          option.value = String(index);
          $('ubUnblockSelect').appendChild(option);
        }
      });
      $('ubUnblockForm').addEventListener('submit', event => {
        event.preventDefault();
        blockRules.splice(Number($('ubUnblockSelect').value), 1);
        saveBlockRules(blockRules);
        window.close();
      });
    }
  });
});

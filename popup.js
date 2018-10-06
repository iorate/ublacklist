loadBlockRules(blockRules => {
  chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
    const url = activeTabs[0].url;
    if (!blockRules.some(rule => rule.compiled && rule.compiled.test(url))) {
      document.body.insertAdjacentHTML('beforeend', `
        <form id="blockForm" style="padding:1em;white-space:nowrap">
          <label>
            ${_('blockThisSite')}:
            <input id="blockInput" type="text" autofocus size="40" spellcheck="false" style="margin:0.5em">
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      `);
      document.getElementById('blockInput').value = new URL(url).origin + '/*';
      document.getElementById('blockForm').addEventListener('submit', event => {
        event.preventDefault();
        const raw = document.getElementById('blockInput').value;
        const compiled = compileBlockRule(raw);
        if (compiled) {
          blockRules.push({ raw, compiled });
          saveBlockRules(blockRules);
        }
        window.close();
      });
    } else {
      document.body.insertAdjacentHTML('beforeend', `
        <form id="unblockForm" style="padding:1em;white-space:nowrap">
          <label>
            ${_('unblockThisSite')}:
            <select id="unblockSelect" autofocus style="margin:0.5em;width:20em">
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
          document.getElementById('unblockSelect').appendChild(option);
        }
      });
      document.getElementById('unblockForm').addEventListener('submit', event => {
        event.preventDefault();
        blockRules.splice(Number(document.getElementById('unblockSelect').value), 1);
        saveBlockRules(blockRules);
        window.close();
      });
    }
  });
});

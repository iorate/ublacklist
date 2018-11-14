for (const element of document.querySelectorAll('[data-i18n]')) {
  element.insertAdjacentHTML('beforeend', _(element.dataset.i18n));
}

(async () => {
  const blockRules = await loadBlockRules();
  const url = (await queryTabs({ active: true, currentWindow: true }))[0].url;
  const blocked = /^(https?|ftp):$/.test(new URL(url).protocol) &&
                  blockRules.some(rule => rule.compiled && rule.compiled.test(url));
  if (!blocked) {
    $('blockInput').value = deriveBlockRule(url) || '';
    $('blockForm').addEventListener('submit', event => {
      event.preventDefault();
      const raw = $('blockInput').value;
      const compiled = compileBlockRule(raw);
      if (compiled) {
        blockRules.push({ raw, compiled });
        (async () => {
          saveBlockRules(blockRules);
          window.close();
        })();
      } else {
        window.close();
      }
    });
    $('blockPopup').style.display = 'block';
  } else {
    blockRules.forEach((rule, index) => {
      if (rule.compiled && rule.compiled.test(url)) {
        const option = document.createElement('option');
        option.textContent = rule.raw;
        option.value = String(index);
        $('unblockSelect').appendChild(option);
      }
    });
    $('unblockForm').addEventListener('submit', event => {
      event.preventDefault();
      blockRules.splice(Number($('unblockSelect').value), 1);
      (async () => {
        saveBlockRules(blockRules);
        window.close();
      })();
    });
    $('unblockPopup').style.display = 'block';
  }
})();

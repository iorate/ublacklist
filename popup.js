for (const element of document.querySelectorAll('[data-i18n]')) {
  element.insertAdjacentHTML('beforeend', _(element.dataset.i18n));
}

(async () => {
  const blockRules = await loadBlockRules();
  const url = new SimpleURL((await queryTabs({active: true, currentWindow: true}))[0].url);
  const blockIndices = [];
  blockRules.forEach((rule, index) => {
    if (rule.test(url)) {
      blockIndices.push(index);
    }
  });
  if (!blockIndices.length) {
    $('blockInput').value = deriveBlockRule(url);
    $('blockForm').addEventListener('submit', event => {
      event.preventDefault();
      const raw = $('blockInput').value;
      const rule = new BlockRule(raw);
      if (rule.isValid) {
        blockRules.push(rule);
        (async () => {
          await saveBlockRules(blockRules);
          window.close();
        })();
      } else {
        window.close();
      }
    });
    $('blockPopup').style.display = 'block';
  } else {
    for (const index of blockIndices) {
      const rule = blockRules[index];
      if (rule.test(url)) {
        const option = document.createElement('option');
        option.textContent = rule.raw;
        option.value = String(index);
        $('unblockSelect').appendChild(option);
      }
    }
    $('unblockForm').addEventListener('submit', event => {
      event.preventDefault();
      blockRules.splice(Number($('unblockSelect').value), 1);
      (async () => {
        await saveBlockRules(blockRules);
        window.close();
      })();
    });
    $('unblockPopup').style.display = 'block';
  }
})();

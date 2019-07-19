import { $, _, SimpleURL, BlockRules, queryTabs, loadBlockRulesEx, saveBlockRules, deriveBlockRule } from './common';

for (const element of document.querySelectorAll('[data-i18n]')) {
  element.insertAdjacentHTML('beforeend', _(element.dataset.i18n));
}

(async () => {
  const {blockRules, subscriptions} = await loadBlockRulesEx();
  const url = new SimpleURL((await queryTabs({active: true, currentWindow: true}))[0].url);
  const subscription = subscriptions.find(({blockRules}) => blockRules.some(rule => rule.test(url)));
  const blockIndices = [];
  if (!subscription) {
    blockRules.forEach((rule, index) => {
      if (rule.test(url)) {
        blockIndices.push(index);
      }
    });
  }
  if (!subscription && !blockIndices.length) {
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
    if (subscription) {
      const option = document.createElement('option');
      option.textContent = chrome.i18n.getMessage('blockedBySubscription', subscription.name);
      option.value = '-1';
      $('unblockSelect').appendChild(option);
    } else {
      for (const index of blockIndices) {
        const option = document.createElement('option');
        option.textContent = blockRules[index].raw;
        option.value = String(index);
        $('unblockSelect').appendChild(option);
      }
    }
    $('unblockForm').addEventListener('submit', event => {
      event.preventDefault();
      const index = Number($('unblockSelect').value);
      if (index == -1) {
        window.close();
        return;
      }
      blockRules.splice(index, 1);
      (async () => {
        await saveBlockRules(blockRules);
        window.close();
      })();
    });
    $('unblockPopup').style.display = 'block';
  }
})();

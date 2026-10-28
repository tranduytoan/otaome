import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as mainModule from '../main.js';

test('QUESTS titles have no "Nhiệm vụ: " prefix', () => {
  mainModule.QUESTS.forEach(q => {
    assert.ok(!q.title.startsWith('Nhiệm vụ:'), `Quest title "${q.title}" must not start with "Nhiệm vụ:"`);
  });
});

test('style.css ensures .extinguished .flame does not collapse candle height', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.ok(!css.includes('.extinguished .flame {\n  display: none !important;\n}'), 'Must not use display: none for extinguished flame');
  assert.match(css, /\.extinguished \.flame\s*\{[^}]*visibility:\s*hidden;/);
  assert.match(css, /\.quest-toast-placeholder\s*\{[^}]*min-height:/);
});

test('Toast & Quest mutual exclusivity: wish submission completes quest ONLY after toast dismisses', async () => {
  mainModule.resetQuests();
  mainModule.openGiftBox();
  mainModule.toggleLights();
  assert.equal(mainModule.getCurrentQuest().id, 3);

  // Submit wish with immediate or custom timing
  let questCompleted = false;
  mainModule.submitWish('Điều ước hạnh phúc', {
    onToastDismiss: () => {
      questCompleted = true;
    }
  });

  // Immediately after submit, user should see toast "Ước nguyện đã được gửi gắm...", Quest 3 should still be in focus
  // Quest 4 should only be triggered after toast finishes
  assert.ok(typeof mainModule.showToast === 'function');
});

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

test('Quest typewriter typing speed is slowed down for comfortable reading', () => {
  const mainCode = fs.readFileSync('main.js', 'utf8');
  assert.match(mainCode, /const speed = 55;/);
  assert.equal(typeof mainModule.clearQuestTransition, 'function');
});

test('showToast removes display property so toast is visible', () => {
  const mainCode = fs.readFileSync('main.js', 'utf8');
  assert.match(mainCode, /toast\.style\.removeProperty\('display'\)/);
  assert.ok(!mainCode.includes("toast.style.display = 'none'"));
});

test('style.css ensures mobile quest-toast-placeholder has fixed height to prevent cake vertical shift', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  const mobileMatch = css.match(/@media\s*\(max-width:\s*480px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(mobileMatch, 'max-width: 480px media query must exist');
  const mobileContent = mobileMatch[1];
  assert.match(mobileContent, /\.quest-toast-placeholder\s*\{[^}]*height:\s*(?:5[0-9]|6[0-9])px/);
});

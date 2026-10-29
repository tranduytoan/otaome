import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as mainModule from '../main.js';

test('Fast action sequence: fast actions do not get stuck on Quest 2 and reach Quest 4', () => {
  mainModule.resetQuests();

  // Fast action: open gift box, immediately turn off lights, immediately close modal with wish, submit wish
  mainModule.openGiftBox();
  mainModule.toggleLights();
  mainModule.handleWishModalClose('Ước mơ tuổi 22');
  mainModule.submitWish('Ước mơ tuổi 22');

  // Target quest index must reflect unlocked candles quest (index 3, Quest 4)
  assert.equal(mainModule.getTargetQuestIndex(), 3, 'Target quest index must be 3 (Quest 4: candles)');
});

test('btn-replay is initially hidden in HTML and main.js reveals it upon typewriter completion', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /id="btn-replay"[^>]*style="display:\s*none;?"/);

  const main = fs.readFileSync('main.js', 'utf8');
  assert.match(main, /btnReplay\.style\.display\s*=\s*['"]inline-block['"]/);
});

test('Multi-line wish formatting handles multiple lines cleanly without inline concatenation bugs', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  // Must check if userWish contains newlines and format accordingly
  assert.ok(
    main.includes('cleanWish.includes(\'\\n\')') ||
    main.includes('userWish.includes(\'\\n\')') ||
    main.includes('\\n"'),
    'main.js must handle multi-line userWish formatting'
  );
});

test('updateQuestUI and resetGame do not run quest typewriter or text sound when not on screen-cake', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  // In updateQuestUI, typeChar must guard against running when currentScreen is not screen-cake
  const updateQuestFn = main.slice(main.indexOf('export function updateQuestUI'), main.indexOf('export function clearToast'));
  assert.ok(
    updateQuestFn.includes("currentScreen !== 'screen-cake'"),
    'updateQuestUI must check currentScreen !== "screen-cake"'
  );
  // resetQuests should not unconditionally call updateQuestUI
  const resetQuestsFn = main.slice(main.indexOf('export function resetQuests'), main.indexOf('export function getCurrentScreen'));
  assert.ok(
    !resetQuestsFn.includes('\n    updateQuestUI();') &&
    !resetQuestsFn.includes('\r\n    updateQuestUI();'),
    'resetQuests must not unconditionally trigger updateQuestUI'
  );
});

test('formatLetterHtml formats Unknown Admin with text-red class and style.css defines red styling', () => {
  assert.equal(typeof mainModule.formatLetterHtml, 'function');
  const formatted = mainModule.formatLetterHtml('"Bởi vì nụ cười của em là đẹp nhất 💙" - Unknown Admin');
  assert.match(formatted, /<span class="text-red">Unknown Admin<\/span>/);

  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.text-red\s*\{[^}]*color:\s*#[0-9a-fA-F]+/);
});

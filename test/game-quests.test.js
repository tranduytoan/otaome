import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as mainModule from '../main.js';

test('index.html contains quest tracker and new interactive elements', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /id="quest-tracker"/);
  assert.match(html, /id="quest-text"/);
  assert.match(html, /id="pixel-gift-box"/);
  assert.match(html, /id="pixel-light-switch"/);
  assert.match(html, /id="table-wish-letter"/);
  assert.match(html, /id="wish-modal"/);
  assert.match(html, /id="wish-input"/);
  assert.match(html, /id="btn-close-wish"/);
  assert.match(html, /id="btn-submit-wish"/);
});

test('main.js exports quest controller and state management', () => {
  assert.equal(typeof mainModule.getCurrentQuest, 'function');
  assert.equal(typeof mainModule.openGiftBox, 'function');
  assert.equal(typeof mainModule.toggleLights, 'function');
  assert.equal(typeof mainModule.submitWish, 'function');
  assert.equal(typeof mainModule.blowIndividualCandle, 'function');
  assert.equal(typeof mainModule.resetQuests, 'function');
});

test('Quest sequence: starts at Quest 1 (open gift box)', () => {
  mainModule.resetQuests();
  const q1 = mainModule.getCurrentQuest();
  assert.equal(q1.id, 1);
  assert.match(q1.title, /quà/i);
});

test('Quest 1 -> Quest 2: opening gift box unlocks light switch and advances quest', () => {
  mainModule.resetQuests();
  const res = mainModule.openGiftBox();
  assert.equal(res.success, true);
  const q2 = mainModule.getCurrentQuest();
  assert.equal(q2.id, 2);
  assert.match(q2.title, /đèn/i);
});

test('Quest 2 -> Quest 3: turning off lights triggers falling letter and advances quest', () => {
  mainModule.resetQuests();
  mainModule.openGiftBox();
  const resLight = mainModule.toggleLights();
  assert.equal(resLight.lightsOff, true);
  const q3 = mainModule.getCurrentQuest();
  assert.equal(q3.id, 3);
  assert.match(q3.title, /thư/i);
});

test('Quest 3 -> Quest 4: submitting wish advances to candle blowing quest', () => {
  mainModule.resetQuests();
  mainModule.openGiftBox();
  mainModule.toggleLights();
  const resWish = mainModule.submitWish('Mọi điều tốt lành');
  assert.equal(resWish.success, true);
  const q4 = mainModule.getCurrentQuest();
  assert.equal(q4.id, 4);
  assert.match(q4.title, /thổi/i);
});

test('Quest 4: individual candles can only be blown when lights are off', () => {
  mainModule.resetQuests();
  mainModule.openGiftBox();
  mainModule.toggleLights(); // lights off
  mainModule.submitWish('Hạnh phúc');
  
  // Turn lights back on
  mainModule.toggleLights(); // lights on
  const failBlow = mainModule.blowIndividualCandle(1);
  assert.equal(failBlow.success, false, 'Cannot blow candles when lights are on');

  // Turn lights off again
  mainModule.toggleLights(); // lights off
  assert.equal(mainModule.blowIndividualCandle(1).success, true);
  assert.equal(mainModule.blowIndividualCandle(2).success, true);
  const finalBlow = mainModule.blowIndividualCandle(3);
  assert.equal(finalBlow.success, true);
  assert.equal(finalBlow.allBlown, true);
});

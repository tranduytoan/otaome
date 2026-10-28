import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as mainModule from '../main.js';

test('Wish completion trigger: closing wish modal with non-empty wish reveals submit button without auto-submitting; user must click submit', () => {
  mainModule.resetQuests();
  mainModule.openGiftBox();
  mainModule.toggleLights();
  assert.equal(mainModule.getCurrentQuest().id, 3);

  // Closing with empty wish does not show submit button or advance quest
  const resEmpty = mainModule.handleWishModalClose('');
  assert.equal(resEmpty.readyToSend, false);
  assert.equal(mainModule.getCurrentQuest().id, 3);

  // Closing with non-empty wish saves wish and shows submit button, but does not advance quest yet (allows editing)
  const resNonEmpty = mainModule.handleWishModalClose('Chúc Thu Thùy tuổi 22 rực rỡ');
  assert.equal(resNonEmpty.readyToSend, true);
  assert.equal(resNonEmpty.wish, 'Chúc Thu Thùy tuổi 22 rực rỡ');
  assert.equal(mainModule.getCurrentQuest().id, 3, 'Must remain on Quest 3 until user clicks submit');

  // Clicking submitWish explicitly sends wish and advances to Quest 4
  const resSubmit = mainModule.submitWish();
  assert.equal(resSubmit.success, true);
  assert.equal(mainModule.getCurrentQuest().id, 4, 'Must advance to Quest 4 after user clicks submit');
});

test('No star element or animation after submitting wish', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(!html.includes('table-wish-star'), 'table-wish-star must be removed from HTML');

  const main = fs.readFileSync('main.js', 'utf8');
  assert.ok(!main.includes('dropping-star'), 'dropping-star animation must be removed from main.js');
});

test('cake-display-wrapper has display flex and candles-wrapper is centered', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.cake-display-wrapper\s*\{[^}]*display:\s*flex/);
  assert.match(css, /\.candles-wrapper\s*\{[^}]*margin:\s*0\s+auto/);
  assert.match(css, /\.candles-wrapper\s*\{[^}]*width:\s*130px/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as mainModule from '../main.js';

test('index.html places quest-toast between window and cake table, and places quest-text below the cake', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  
  const windowPos = html.indexOf('class="pixel-window"');
  const toastPos = html.indexOf('class="quest-toast-placeholder"');
  const cakePos = html.indexOf('class="pixel-cake-container"');
  const dialoguePos = html.indexOf('id="quest-text"');

  assert.ok(windowPos > 0, 'pixel-window must exist');
  assert.ok(toastPos > 0, 'quest-toast-placeholder must exist');
  assert.ok(cakePos > 0, 'pixel-cake-container must exist');
  assert.ok(dialoguePos > 0, 'quest-text must exist');

  assert.ok(windowPos < toastPos, 'window must be before toast');
  assert.ok(toastPos < cakePos, 'toast must be before cake (between window and cake)');
  assert.ok(cakePos < dialoguePos, 'quest-text must be below the cake');
});

test('Quest sequence follows RPG dialogue steps 1 through 5', () => {
  mainModule.resetQuests();
  
  // Step 1: Quest text 1 initially active
  assert.equal(mainModule.getCurrentQuest().id, 1);
  assert.match(mainModule.getCurrentQuest().title, /quà/i);

  // Step 2: Open gift box -> advances to Quest 2
  mainModule.openGiftBox();
  assert.equal(mainModule.getCurrentQuest().id, 2);
  assert.match(mainModule.getCurrentQuest().title, /đèn/i);

  // Step 3: Turn off lights -> advances to Quest 3
  mainModule.toggleLights();
  assert.equal(mainModule.getCurrentQuest().id, 3);
  assert.match(mainModule.getCurrentQuest().title, /thư/i);

  // Step 4: Wish entered -> ready to submit, but remains on Quest 3
  const resClose = mainModule.handleWishModalClose('Điều ước ý nghĩa');
  assert.equal(resClose.readyToSend, true);
  assert.equal(mainModule.getCurrentQuest().id, 3);

  // Step 5: Submit wish -> advances to Quest 4
  const resSubmit = mainModule.submitWish();
  assert.equal(resSubmit.success, true);
  assert.equal(mainModule.getCurrentQuest().id, 4);
  assert.match(mainModule.getCurrentQuest().title, /thổi/i);

  // Step 6: Blow all candles -> advances to Complete (Quest 5)
  mainModule.blowIndividualCandle(1);
  mainModule.blowIndividualCandle(2);
  const resBlow3 = mainModule.blowIndividualCandle(3);
  assert.equal(resBlow3.allBlown, true);
  assert.equal(mainModule.getCurrentQuest().id, 5);
  assert.match(mainModule.getCurrentQuest().title, /hoàn thành/i);
});

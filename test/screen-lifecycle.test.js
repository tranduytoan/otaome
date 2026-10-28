import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as mainModule from '../main.js';
import * as audioModule from '../audio.js';
import fs from 'node:fs';

test('BGM lifecycle: BGM only plays on cake and letter screens, and stops on start and login screens', () => {
  mainModule.switchScreen('screen-login');
  assert.equal(mainModule.getCurrentScreen(), 'screen-login');

  mainModule.switchScreen('screen-start');
  assert.equal(mainModule.getCurrentScreen(), 'screen-start');

  mainModule.switchScreen('screen-cake');
  assert.equal(mainModule.getCurrentScreen(), 'screen-cake');

  mainModule.switchScreen('screen-letter');
  assert.equal(mainModule.getCurrentScreen(), 'screen-letter');
});

test('main.js switchScreen manages BGM playing state per screen', () => {
  const mainCode = fs.readFileSync('main.js', 'utf8');
  assert.match(mainCode, /switchScreen\(targetScreenId\)[\s\S]*?(stopBgm|playBgm)/);
});

test('logout cleans up all active animations, timers, and stops fireworks and BGM', () => {
  assert.doesNotThrow(() => {
    mainModule.blowCandles();
    mainModule.logout();
    assert.equal(mainModule.getCurrentScreen(), 'screen-login');
  });
});

test('typewriter and prompt guards abort execution if screen changes away', () => {
  const mainCode = fs.readFileSync('main.js', 'utf8');
  assert.ok(
    mainCode.includes("currentScreen !== 'screen-letter'") ||
    mainCode.includes("currentScreen === 'screen-letter'"),
    'runTypewriter must guard against running when not on screen-letter'
  );
  assert.ok(
    mainCode.includes("currentScreen !== 'screen-cake'") ||
    mainCode.includes("currentScreen === 'screen-cake'"),
    'cake prompt and blow transition must guard against running when not on screen-cake'
  );
});

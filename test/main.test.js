import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as mainModule from '../main.js';

test('main.js defines birthday config for Thu Thùy and handles config correctly', () => {
  assert.ok(mainModule.BIRTHDAY_CONFIG);
  assert.equal(mainModule.BIRTHDAY_CONFIG.name, 'Thu Thùy');
  assert.equal(mainModule.BIRTHDAY_CONFIG.birthdate, '29/10/2004');
  assert.equal(mainModule.BIRTHDAY_CONFIG.themeColor, '#00f5ff');
  assert.ok(Array.isArray(mainModule.BIRTHDAY_CONFIG.wishes));
  assert.ok(mainModule.BIRTHDAY_CONFIG.wishes.length > 0);
});

test('main.js exports state controller methods', () => {
  assert.equal(typeof mainModule.initApp, 'function');
  assert.equal(typeof mainModule.getCurrentScreen, 'function');
  assert.equal(typeof mainModule.switchScreen, 'function');
  assert.equal(typeof mainModule.blowCandles, 'function');
  assert.equal(typeof mainModule.resetGame, 'function');
  assert.equal(typeof mainModule.typeCakePrompt, 'function');
  assert.equal(typeof mainModule.clearCakePrompt, 'function');
  assert.equal(typeof mainModule.clearLevelUp, 'function');
});

test('main.js safely initializes in mock / non-DOM environment', () => {
  assert.doesNotThrow(() => {
    mainModule.initApp();
  });
});

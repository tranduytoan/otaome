import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as audioModule from '../audio.js';
import * as mainModule from '../main.js';

test('main.js defines AUTH_CREDENTIALS with username thuthuy and password xinhdep and 1-hour duration', () => {
  assert.ok(mainModule.AUTH_CREDENTIALS);
  assert.equal(mainModule.AUTH_CREDENTIALS.username, 'thuthuy');
  assert.equal(mainModule.AUTH_CREDENTIALS.password, 'xinhdep');
  assert.equal(mainModule.AUTH_CREDENTIALS.sessionDurationMs, 3600000);
});

test('main.js login validates credentials correctly', () => {
  assert.equal(typeof mainModule.login, 'function');
  assert.equal(mainModule.login('thuthuy', 'xinhdep').success, true);
  assert.equal(mainModule.login('THUTHUY', 'XINHDEP').success, true);
  assert.equal(mainModule.login('wrong', 'xinhdep').success, false);
  assert.equal(mainModule.login('thuthuy', 'wrong').success, false);
});

test('main.js checkAuthSession checks 1-hour timestamp validity', () => {
  assert.equal(typeof mainModule.checkAuthSession, 'function');
  assert.equal(typeof mainModule.logout, 'function');
});

test('index.html contains screen-login and login form elements', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /id="screen-login"/);
  assert.match(html, /id="login-username"/);
  assert.match(html, /id="login-password"/);
  assert.match(html, /id="btn-login"/);
  assert.match(html, /id="login-error"/);
});

test('audio.js separates bgm gain and sfx so muting bgm preserves sfx', () => {
  const audioCode = fs.readFileSync('audio.js', 'utf8');
  assert.match(audioCode, /bgmGain/);
  assert.match(audioCode, /sfxGain/);
  assert.doesNotThrow(() => {
    audioModule.toggleMute();
    audioModule.playSfx('text');
    audioModule.playSfx('error');
    audioModule.toggleMute();
  });
});

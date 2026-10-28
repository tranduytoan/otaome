import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as audioModule from '../audio.js';

test('audio.js exports all required audio methods', () => {
  assert.equal(typeof audioModule.initAudio, 'function');
  assert.equal(typeof audioModule.playBgm, 'function');
  assert.equal(typeof audioModule.stopBgm, 'function');
  assert.equal(typeof audioModule.toggleMute, 'function');
  assert.equal(typeof audioModule.isMuted, 'function');
  assert.equal(typeof audioModule.playSfx, 'function');
  assert.ok(Array.isArray(audioModule.HAPPY_BIRTHDAY_NOTES));
});

test('audio.js handles mute toggling correctly', () => {
  const initial = audioModule.isMuted();
  const toggled = audioModule.toggleMute();
  assert.equal(toggled, !initial);
  assert.equal(audioModule.isMuted(), toggled);
  // Restore
  audioModule.toggleMute();
  assert.equal(audioModule.isMuted(), initial);
});

test('audio.js executes safe mocks without crashing in non-browser environment', () => {
  assert.doesNotThrow(() => {
    audioModule.initAudio();
    audioModule.playBgm();
    audioModule.stopBgm();
    audioModule.playSfx('coin');
    audioModule.playSfx('blow');
    audioModule.playSfx('firework');
    audioModule.playSfx('chime');
    audioModule.playSfx('click');
  });
});

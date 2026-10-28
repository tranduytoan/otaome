import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as audioModule from '../audio.js';
import * as mainModule from '../main.js';

test('audio.js supports pause/paragraph break sound effect', () => {
  assert.doesNotThrow(() => {
    audioModule.playSfx('pause');
  });
});

test('main.js implements typewriter effect for cake prompt with button disable/enable logic', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  assert.ok(main.includes('typeCakePrompt') || main.includes('cakePrompt'));
  assert.match(main, /btnBlow\.disabled\s*=\s*true/);
  assert.match(main, /btnBlow\.disabled\s*=\s*false/);
});

test('main.js implements paragraph-by-paragraph typewriter with pause delay and sound effect', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  assert.ok(main.includes("playSfx('pause')"));
  assert.ok(main.includes('BIRTHDAY_CONFIG.wishes'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as audioModule from '../audio.js';

test('audio.js supports text/dialogue sound effect for RPG typewriter', () => {
  assert.doesNotThrow(() => {
    audioModule.playSfx('text');
  });
});

test('index.html has vertical level rolling transition structure', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /level-roller/);
  assert.match(html, /21/);
  assert.match(html, /22/);
});

test('style.css defines vertical slide animation for level numbers', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /@keyframes\s+rollUpLevel/);
  assert.match(css, /\.level-roller/);
});

test('main.js plays text blip sound during typewriter effect', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  assert.ok(main.includes("playSfx('text')") || main.includes('playTextBlip'));
});

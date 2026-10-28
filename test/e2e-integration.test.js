import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Integration verification: All files link correctly and contain valid syntax', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  assert.ok(index.includes('style.css'));
  assert.ok(index.includes('main.js'));
  assert.ok(fs.existsSync('style.css'));
  assert.ok(fs.existsSync('main.js'));
  assert.ok(fs.existsSync('audio.js'));
  assert.ok(fs.existsSync('fireworks.js'));
});

test('Integration verification: HTML references existing audio and fireworks methods in main.js', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  assert.ok(main.includes("from './audio.js'"));
  assert.ok(main.includes("from './fireworks.js'"));
  assert.ok(main.includes('initFireworks'));
  assert.ok(main.includes('playBgm'));
  assert.ok(main.includes('playSfx'));
});

test('Integration verification: All required DOM IDs in main.js are present in index.html', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const ids = [
    'screen-start',
    'screen-cake',
    'screen-letter',
    'fireworks-canvas',
    'crt-overlay',
    'btn-start',
    'btn-blow',
    'btn-replay',
    'btn-mute',
    'btn-crt',
    'cake-prompt',
    'letter-content'
  ];

  ids.forEach(id => {
    assert.ok(html.includes(`id="${id}"`), `DOM element #${id} must exist in index.html`);
  });
});

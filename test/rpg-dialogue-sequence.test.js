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

test('style.css centers rpg-dialogue-box text block while keeping multi-line text left-aligned', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.rpg-dialogue-box\s*\{[^}]*justify-content:\s*center/);
  assert.match(css, /\.rpg-dialogue-text\s*\{[^}]*text-align:\s*left/);
});

test('style.css reduces vertical gap between cake container and dialogue box', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.pixel-cake-container\s*\{[^}]*margin-bottom:\s*([0-9]|1[0-2])px/);
  assert.match(css, /\.cake-action-box\s*\{[^}]*margin-top:\s*([0-9]|1[0-2])px/);
});

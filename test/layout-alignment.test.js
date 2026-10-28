import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('style.css ensures window is centered and light switch does not offset it', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.room-wall-fixtures\s*\{[^}]*position:\s*relative/);
  assert.match(css, /\.pixel-light-switch\s*\{[^}]*position:\s*absolute/);
  assert.match(css, /\.pixel-light-switch\s*\{[^}]*right:\s*\d+px/);
});

test('style.css ensures cake-display-wrapper and candles-wrapper are centered over the cake', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.cake-display-wrapper\s*\{[^}]*display:\s*flex/);
  assert.match(css, /\.cake-display-wrapper\s*\{[^}]*align-items:\s*center/);
  assert.match(css, /\.candles-wrapper\s*\{[^}]*justify-content:\s*center/);
});

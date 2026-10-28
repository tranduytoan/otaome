import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('style.css defines cyan theme variables, pixelated rendering and animations', () => {
  assert.ok(fs.existsSync('style.css'), 'style.css must exist');
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /--cyan-primary:\s*#00f5ff/i);
  assert.match(css, /image-rendering:\s*pixelated/);
  assert.match(css, /@keyframes\s+flicker/);
  assert.match(css, /@keyframes\s+smoke/);
  assert.match(css, /\.crt-scanlines/);
  assert.match(css, /\.pixel-cake/);
  assert.match(css, /\.pixel-candle/);
  assert.match(css, /\.retro-btn/);
  assert.match(css, /@media\s*\(max-width:/);
});

test('style.css embeds Departure Mono Viet font for full Vietnamese diacritics support', () => {
  assert.ok(fs.existsSync('fonts/DepartureMonoViet-v3.otf'), 'Font file DepartureMonoViet-v3.otf must exist');
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /Departure Mono Viet/);
  assert.match(css, /fonts\/DepartureMonoViet-v3\.otf/);
});

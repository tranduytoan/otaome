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

test('style.css ensures .pixel-heart is perfectly symmetric around center axis x = 0', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  const heartMatch = css.match(/\.pixel-heart\s*\{([^}]+)\}/);
  assert.ok(heartMatch, '.pixel-heart rule must exist');
  const heartBody = heartMatch[1];

  // Extract all box-shadow coordinates
  const shadowLines = heartBody
    .split('\n')
    .filter(line => line.includes('var(--pink-accent)'));
  assert.ok(shadowLines.length >= 10, 'Should have pixel heart box-shadows');

  const points = shadowLines.map(line => {
    const m = line.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+0\s+0/);
    return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : null;
  }).filter(Boolean);

  const pointSet = new Set(points.map(([x, y]) => `${x},${y}`));

  // Bottom tip must be at x = 0 (aligned with center)
  const maxY = Math.max(...points.map(p => p[1]));
  const bottomTips = points.filter(p => p[1] === maxY);
  assert.equal(bottomTips.length, 1, 'Should have 1 bottom tip pixel');
  assert.equal(bottomTips[0][0], 0, `Bottom tip must be centered at x = 0, but was at x = ${bottomTips[0][0]}`);

  // Every shadow (x, y) must have its symmetric counterpart (-x, y)
  points.forEach(([x, y]) => {
    assert.ok(
      pointSet.has(`${-x},${y}`),
      `Pixel heart must be symmetric around x = 0: (${x}, ${y}) is missing counterpart (${-x}, ${y})`
    );
  });
});

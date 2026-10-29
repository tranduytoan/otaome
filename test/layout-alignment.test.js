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

test('style.css ensures table-items-slot has fixed min-height placeholder to prevent cake layout shift', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.table-items-slot\s*\{[^}]*min-height:\s*([2-4][0-9])px/);
});

test('index.html and style.css define animated pixel letter envelope without text label banner', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('id="table-wish-letter"'));
  assert.ok(html.includes('mini-envelope-pixel'));
  assert.ok(!html.includes('mini-letter-label'), 'Should remove text label from wish letter');

  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /@keyframes\s+envelopeWiggle/);
  assert.match(css, /\.mini-envelope-pixel\s*\{[^}]*animation:\s*envelopeWiggle/);
});

test('style.css animates wish letter flying towards window center into the night sky', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  const flyMatch = css.match(/@keyframes\s+letterFlyAway\s*\{([\s\S]*?)\n\}/);
  assert.ok(flyMatch, '@keyframes letterFlyAway must exist');

  const keyframeBody = flyMatch[1];
  // Check that 100% has vertical elevation reaching the window (Y <= -250px)
  const finalMatch = keyframeBody.match(/100%\s*\{[^}]*translate\(\s*(-?\d+)px\s*,\s*(-?\d+)px\s*\)/);
  assert.ok(finalMatch, '100% must have translate(X, Y)');

  const finalX = parseInt(finalMatch[1], 10);
  const finalY = parseInt(finalMatch[2], 10);

  // Window is horizontally centered around X = 0 (width 120px, so [-60px, 60px])
  assert.ok(
    Math.abs(finalX) <= 40,
    `Letter should fly towards window center (X near 0), but flew to X = ${finalX}px`
  );
  // Window center is ~260-290px above the table letter
  assert.ok(
    finalY <= -250,
    `Letter must fly high enough to reach the window (Y <= -250px), but only reached Y = ${finalY}px`
  );
});

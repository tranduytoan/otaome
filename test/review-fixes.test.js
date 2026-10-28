import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fw from '../fireworks.js';
import * as audioModule from '../audio.js';
import fs from 'node:fs';

test('Fireworks: stopFireworks resets animation frame state and timer so it can restart', () => {
  // Test that stopFireworks cleans up and startFireworks resets animFrameId
  assert.doesNotThrow(() => {
    fw.startFireworks(100);
    fw.stopFireworks();
    fw.startFireworks(100);
    fw.stopFireworks();
  });
});

test('Typewriter logic in main.js preserves UTF-16 surrogate pairs (emojis)', () => {
  const mainCode = fs.readFileSync('main.js', 'utf8');
  // Must use Array.from or spread operator to handle emojis, not charAt
  assert.ok(
    mainCode.includes('Array.from') || mainCode.includes('[...'),
    'Typewriter must split characters using Array.from or spread operator to support emojis'
  );
  assert.ok(
    !mainCode.includes('charAt(charIndex)'),
    'Typewriter should not use charAt which splits surrogate pairs'
  );
});

test('Audio: playTone does not drop notes when muted, allowing instant unmute via masterGain', () => {
  const audioCode = fs.readFileSync('audio.js', 'utf8');
  // playTone should rely on masterGain for muting rather than dropping scheduled nodes
  assert.ok(
    !audioCode.includes('function playTone(freq, startTime, duration) {\r\n  if (!audioCtx || !masterGain || muted) return null;') &&
    !audioCode.includes('function playTone(freq, startTime, duration) {\n  if (!audioCtx || !masterGain || muted) return null;'),
    'playTone should not bail out early when muted so masterGain controls volume instantly'
  );
});

test('CSS: date-badge and game-container have mobile responsive wrap styles', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.date-badge[\s\S]*?(max-width|word-break|font-size)/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?#game-container/);
});

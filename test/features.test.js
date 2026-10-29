import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as audioModule from '../audio.js';
import * as mainModule from '../main.js';

test('HTML has hud-level element and levelup-banner element with +1505 EXP', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /id="hud-level"/);
  assert.match(html, /id="levelup-banner"/);
  assert.match(html, /\+1505 EXP/);
});

test('style.css defines levelup animations and fixes cake tier-top drips without overflow', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.levelup-banner/);
  assert.match(css, /@keyframes\s+levelUpPopup/);
  assert.match(css, /@keyframes\s+expFill/);
  // Tier top drips should not overflow tier width (130px)
  assert.ok(!css.includes('116px 6px 0 0 var(--cyan-light)'), 'Removed overflowing 116px drip shadow');
});

test('style.css ensures mobile frosting-drips does not overflow 100px tier-top on max-width: 768px', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  const mediaMatch = css.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(mediaMatch, 'max-width: 768px media query must exist');
  const mediaContent = mediaMatch[1];
  assert.match(mediaContent, /\.frosting-drips::after/);
  // Must not have 102px or 84px offset on mobile 100px tier
  assert.ok(!mediaContent.includes('102px'), 'Must not have 102px drip offset on mobile 100px tier');
  assert.ok(!mediaContent.includes('84px'), 'Must not have 84px drip offset on mobile 100px tier');
});

test('audio.js supports levelup sound effect', () => {
  assert.doesNotThrow(() => {
    audioModule.playSfx('levelup');
  });
});

test('main.js handles level up progression from 21 to 22', () => {
  assert.equal(mainModule.BIRTHDAY_CONFIG.expGained, 1505);
  assert.equal(mainModule.BIRTHDAY_CONFIG.baseLevel, 21);
  assert.equal(mainModule.BIRTHDAY_CONFIG.level, 22);
});

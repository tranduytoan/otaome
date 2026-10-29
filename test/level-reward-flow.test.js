import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as mainModule from '../main.js';

test('index.html contains level-reward-area, btn-claim-gift and birthday-letter-container', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /id="level-reward-area"/);
  assert.match(html, /id="btn-claim-gift"/);
  assert.match(html, /id="birthday-letter-container"/);
  assert.match(html, /Level 22's/i);
});

test('main.js exports claimLevelReward function', () => {
  assert.equal(typeof mainModule.claimLevelReward, 'function');
});

test('style.css defines reward pop-in and envelope animations', () => {
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /\.level-reward-area/);
  assert.match(css, /\.reward-gift-letter/);
  assert.match(css, /@keyframes\s+rewardPopIn/);
});

test('claimLevelReward hides levelup banner and displays birthday-letter-container', () => {
  // Mock document elements
  const mockBanner = { style: { display: 'flex' } };
  const mockLetter = { style: { display: 'none' } };
  const mockContent = { textContent: '' };

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'levelup-banner') return mockBanner;
      if (id === 'birthday-letter-container') return mockLetter;
      if (id === 'letter-content') return mockContent;
      return null;
    }
  };

  mainModule.claimLevelReward();

  assert.equal(mockBanner.style.display, 'none', 'Levelup banner must be hidden after claiming reward');
  assert.equal(mockLetter.style.display, 'flex', 'Birthday letter container must be revealed after claiming reward');

  delete globalThis.document;
});

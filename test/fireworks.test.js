import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fw from '../fireworks.js';

test('fireworks.js exports initialization and trigger functions', () => {
  assert.equal(typeof fw.initFireworks, 'function');
  assert.equal(typeof fw.startFireworks, 'function');
  assert.equal(typeof fw.stopFireworks, 'function');
  assert.equal(typeof fw.triggerBurst, 'function');
  assert.ok(Array.isArray(fw.PIXEL_PALETTE));
  assert.ok(fw.PIXEL_PALETTE.includes('#00f5ff'));
});

test('fireworks.js handles mock canvas and non-browser environment safely', () => {
  assert.doesNotThrow(() => {
    // Should safely handle non-DOM environment or mock canvas
    fw.initFireworks(null);
    fw.startFireworks(500);
    fw.triggerBurst(100, 100);
    fw.stopFireworks();
  });
});

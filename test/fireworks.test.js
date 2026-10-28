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

test('fireworks.js stopFireworks clears the canvas completely with clearRect', () => {
  let cleared = false;
  const mockCtx = {
    clearRect: () => { cleared = true; },
    save: () => {},
    restore: () => {},
    fillRect: () => {},
  };
  const mockCanvas = {
    getContext: () => mockCtx,
    width: 800,
    height: 600,
    style: {}
  };

  fw.initFireworks(mockCanvas);
  fw.startFireworks();
  fw.stopFireworks();
  assert.equal(cleared, true, 'stopFireworks must call ctx.clearRect to clear any paused or frozen particles');
});

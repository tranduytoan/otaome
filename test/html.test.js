import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('index.html contains all required game stages and control elements', () => {
  assert.ok(fs.existsSync('index.html'), 'index.html must exist');
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /id="screen-start"/);
  assert.match(html, /id="screen-cake"/);
  assert.match(html, /id="screen-letter"/);
  assert.match(html, /id="fireworks-canvas"/);
  assert.match(html, /id="crt-overlay"/);
  assert.match(html, /id="btn-start"/);
  assert.match(html, /id="btn-blow"/);
  assert.match(html, /id="btn-mute"/);
  assert.match(html, /id="btn-crt"/);
  assert.match(html, /Thu Thùy/);
  assert.match(html, /Press Start 2P/);
  assert.match(html, /style\.css/);
  assert.match(html, /type="module"\s+src="main\.js"/);
  assert.match(html, /href="\.\/assets\/images\/favicon\.png"|href="assets\/images\/favicon\.png"/);
  assert.ok(!html.includes('href="/assets/'), 'Favicon href must not use root-absolute path for GitHub Pages subpath compatibility');
});

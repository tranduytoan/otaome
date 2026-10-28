import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Project has package.json with test script and ES module type', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.type, 'module');
  assert.ok(pkg.scripts && pkg.scripts.test);
  assert.match(pkg.scripts.test, /node\s+--test/);
});

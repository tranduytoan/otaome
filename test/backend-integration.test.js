import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as mainModule from '../main.js';

test('main.js defines BE_URL and AUTH_CODES constants', () => {
  assert.ok(typeof mainModule.BE_URL === 'string', 'BE_URL must be defined');
  assert.ok(mainModule.AUTH_CODES, 'AUTH_CODES must be defined');
  assert.equal(mainModule.AUTH_CODES.SUCCESS, 'AUTH_SUCCESS_2910');
  assert.equal(mainModule.AUTH_CODES.FAILED, 'AUTH_FAILED_INVALID');
});

test('getBackendUrl normalizes domain without protocol to https', () => {
  assert.equal(typeof mainModule.getBackendUrl, 'function');
  assert.match(mainModule.getBackendUrl(), /^https:\/\//);
  assert.ok(!mainModule.getBackendUrl().endsWith('/'));
});

test('getDeviceInfo collects safe and legal device metadata', () => {
  assert.equal(typeof mainModule.getDeviceInfo, 'function');
  const info = mainModule.getDeviceInfo();
  assert.ok(typeof info === 'object');
  assert.ok('userAgent' in info);
  assert.ok('screen' in info || 'screenResolution' in info);
  assert.ok('timeZone' in info);
  assert.ok('language' in info);
});

test('parseJwtPayload extracts claims from JWT token', () => {
  assert.equal(typeof mainModule.parseJwtPayload, 'function');
  const payload = { sub: 'thuthuy', exp: Math.floor(Date.now() / 1000) + 1800 };
  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const token = `header.${base64Url(payload)}.signature`;

  const parsed = mainModule.parseJwtPayload(token);
  assert.notEqual(parsed, null);
  assert.equal(parsed.sub, 'thuthuy');
  assert.equal(parsed.exp, payload.exp);
});

test('checkAuthSession verifies JWT token expiration (30-min window)', () => {
  // Mock localStorage
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

  // 1. Valid active token (expires in 1800s)
  const validToken = `h.${base64Url({ sub: 'thuthuy', exp: Math.floor(Date.now() / 1000) + 1800 })}.s`;
  store[mainModule.AUTH_STORAGE_KEY] = JSON.stringify({
    username: 'thuthuy',
    token: validToken,
    timestamp: Date.now()
  });
  assert.equal(mainModule.checkAuthSession(), true, 'Valid token should be authenticated');

  // 2. Expired token (expired 10s ago)
  const expiredToken = `h.${base64Url({ sub: 'thuthuy', exp: Math.floor(Date.now() / 1000) - 10 })}.s`;
  store[mainModule.AUTH_STORAGE_KEY] = JSON.stringify({
    username: 'thuthuy',
    token: expiredToken,
    timestamp: Date.now() - 20000
  });
  assert.equal(mainModule.checkAuthSession(), false, 'Expired token should fail authentication');

  delete globalThis.localStorage;
});

test('loginBackend handles successful auth with token and failure with error', async () => {
  assert.equal(typeof mainModule.loginBackend, 'function');

  // Mock fetch
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    if (body.username === 'thuthuy' && body.password === 'xinhdep') {
      return {
        ok: true,
        json: async () => ({
          code: mainModule.AUTH_CODES.SUCCESS,
          token: 'mock.jwt.token',
          expiresIn: 1800,
          username: 'thuthuy'
        })
      };
    }
    return {
      ok: false,
      status: 401,
      json: async () => ({
        code: mainModule.AUTH_CODES.FAILED,
        error: 'Sai Username hoặc Password'
      })
    };
  };

  const resSuccess = await mainModule.loginBackend('thuthuy', 'xinhdep');
  assert.equal(resSuccess.success, true);
  assert.equal(resSuccess.token, 'mock.jwt.token');

  const resFail = await mainModule.loginBackend('wrong', 'wrong');
  assert.equal(resFail.success, false);

  globalThis.fetch = originalFetch;
});

test('logWishToBackend sends wish and device info with Authorization header', async () => {
  assert.equal(typeof mainModule.logWishToBackend, 'function');

  let intercepted = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    intercepted = { url, opts, body: JSON.parse(opts.body) };
    return {
      ok: true,
      json: async () => ({ success: true, key: 'log:123456789' })
    };
  };

  // Setup active session
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  store[mainModule.AUTH_STORAGE_KEY] = JSON.stringify({
    username: 'thuthuy',
    token: 'test.auth.jwt',
    timestamp: Date.now()
  });

  const res = await mainModule.logWishToBackend('Chúc mừng sinh nhật');
  assert.equal(res.success, true);
  assert.ok(intercepted);
  assert.match(intercepted.url, /\/api\/log-wish/);
  assert.equal(intercepted.opts.headers['Authorization'], 'Bearer test.auth.jwt');
  assert.equal(intercepted.body.wish, 'Chúc mừng sinh nhật');
  assert.ok(intercepted.body.device_info);

  globalThis.fetch = originalFetch;
  delete globalThis.localStorage;
});

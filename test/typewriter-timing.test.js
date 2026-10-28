import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as audioModule from '../audio.js';
import * as mainModule from '../main.js';

test('audio.js supports pause/paragraph break sound effect', () => {
  assert.doesNotThrow(() => {
    audioModule.playSfx('pause');
  });
});

test('main.js implements typewriter effect for cake prompt with button disable/enable logic', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  assert.ok(main.includes('typeCakePrompt') || main.includes('cakePrompt'));
  assert.match(main, /btnBlow\.disabled\s*=\s*true/);
  assert.match(main, /btnBlow\.disabled\s*=\s*false/);
});

test('main.js implements paragraph-by-paragraph typewriter with pause delay and sound effect', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  assert.ok(main.includes("playSfx('pause')"));
  assert.ok(main.includes('BIRTHDAY_CONFIG.wishes'));
});

test('main.js waits for levelup banner animation before starting letter typewriter', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  // Ensure runTypewriter is not invoked immediately alongside triggerLevelUp
  assert.ok(
    !main.includes('triggerLevelUp();\n    runTypewriter();') &&
    !main.includes('triggerLevelUp();\r\n    runTypewriter();'),
    'runTypewriter should not run simultaneously with triggerLevelUp'
  );
  // triggerLevelUp should accept a callback or trigger runTypewriter after animation finishes
  assert.ok(
    main.includes('triggerLevelUp(() =>') ||
    main.includes('triggerLevelUp(runTypewriter)') ||
    (main.includes('triggerLevelUp') && main.includes('onComplete')),
    'triggerLevelUp must trigger onComplete callback after banner animation'
  );
});

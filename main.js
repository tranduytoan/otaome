/**
 * Happy Birthday Thu Thùy - Pixel Art Main Game Controller
 * Manages screen transitions, candle blowing, typewriter letter & controls
 */

import { initAudio, playBgm, stopBgm, toggleMute, isMuted, playSfx } from './audio.js';
import { initFireworks, startFireworks, stopFireworks, triggerBurst } from './fireworks.js';

// User-editable configuration for easy personalization
export const BIRTHDAY_CONFIG = {
  name: 'Thu Thùy',
  birthdate: '29/10/2004',
  level: 22,
  themeColor: '#00f5ff',
  wishes: [
    "Chúc mừng sinh nhật lần thứ 22 của Thu Thùy! ✨🎮",
    "Bước sang tuổi mới, chúc bạn luôn giữ nụ cười rạng rỡ, ngập tràn năng lượng tích cực và luôn hạnh phúc.",
    "Chúc mọi dự định và ước mơ của bạn trong năm nay đều sẽ nở hoa rực rỡ như những hạt pháo hoa pixel này!",
    "Mong rằng mỗi ngày của bạn đều là một màn chơi thật vui vẻ, bình yên và ngập tràn may mắn. 💙",
    "LEVEL UP SUCCESSFUL! Happy Birthday, Thu Thùy! 🎂✨"
  ]
};

let currentScreen = 'screen-start';
let isBlowing = false;
let typewriterTimeouts = [];

/**
 * Get current active screen ID
 */
export function getCurrentScreen() {
  return currentScreen;
}

/**
 * Switch game screen with smooth transition
 * @param {'screen-start' | 'screen-cake' | 'screen-letter'} targetScreenId
 */
export function switchScreen(targetScreenId) {
  currentScreen = targetScreenId;
  if (typeof document === 'undefined') return;

  const screens = document.querySelectorAll('.game-screen');
  screens.forEach(screen => {
    if (screen.id === targetScreenId) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });
}

/**
 * Clear all typewriter timers to prevent overlapping
 */
function clearTypewriter() {
  typewriterTimeouts.forEach(t => clearTimeout(t));
  typewriterTimeouts = [];
}

/**
 * Run 8-bit typewriter effect for the birthday letter
 */
function runTypewriter() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('letter-content');
  if (!container) return;

  clearTypewriter();
  container.textContent = '';

  const fullText = BIRTHDAY_CONFIG.wishes.join('\n\n');
  const characters = Array.from(fullText);
  let charIndex = 0;
  const speed = 35; // ms per character

  function typeChar() {
    if (charIndex < characters.length) {
      charIndex++;
      container.textContent = characters.slice(0, charIndex).join('');
      const timeout = setTimeout(typeChar, speed);
      typewriterTimeouts.push(timeout);
    }
  }

  typeChar();
}

/**
 * Blow out the birthday candles
 */
export function blowCandles() {
  if (isBlowing) return;
  isBlowing = true;

  if (typeof document === 'undefined') return;

  const btnBlow = document.getElementById('btn-blow');
  if (btnBlow) {
    btnBlow.disabled = true;
    btnBlow.style.opacity = '0.5';
    btnBlow.style.cursor = 'not-allowed';
  }

  // Audio & Candle visual effect
  playSfx('blow');

  const candles = document.querySelectorAll('.pixel-candle');
  candles.forEach(candle => {
    candle.classList.add('extinguished');
  });

  const promptEl = document.getElementById('cake-prompt');
  if (promptEl) {
    promptEl.textContent = 'Ước nguyện đã được gửi gắm vào các vì sao! ✨';
    promptEl.style.color = '#ffd166';
  }

  // Start celebratory pixel fireworks
  playSfx('firework');
  startFireworks(6000);

  // Transition to Letter screen after celebration pause
  const t = setTimeout(() => {
    switchScreen('screen-letter');
    playSfx('chime');
    runTypewriter();
  }, 2400);
  typewriterTimeouts.push(t);
}

/**
 * Reset game to initial start screen
 */
export function resetGame() {
  isBlowing = false;
  clearTypewriter();
  stopFireworks();

  if (typeof document === 'undefined') return;

  // Reset candle visuals
  const candles = document.querySelectorAll('.pixel-candle');
  candles.forEach(candle => {
    candle.classList.remove('extinguished');
  });

  // Reset blow button
  const btnBlow = document.getElementById('btn-blow');
  if (btnBlow) {
    btnBlow.disabled = false;
    btnBlow.style.opacity = '1';
    btnBlow.style.cursor = 'pointer';
  }

  // Reset prompt text
  const promptEl = document.getElementById('cake-prompt');
  if (promptEl) {
    promptEl.textContent = 'Hãy ước một điều ước thật đẹp và thổi nến nhé!';
    promptEl.style.color = 'var(--cyan-soft)';
  }

  // Clear letter
  const container = document.getElementById('letter-content');
  if (container) {
    container.innerHTML = '';
  }

  switchScreen('screen-start');
}

/**
 * Initialize DOM listeners and modules
 */
export function initApp() {
  if (typeof document === 'undefined') return;

  // Initialize Canvas Fireworks
  const canvas = document.getElementById('fireworks-canvas');
  if (canvas) {
    initFireworks(canvas);
  }

  // Start Screen Button
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      initAudio();
      playSfx('coin');
      playBgm();
      switchScreen('screen-cake');
    });
  }

  // Blow Candle Button
  const btnBlow = document.getElementById('btn-blow');
  if (btnBlow) {
    btnBlow.addEventListener('click', () => {
      blowCandles();
    });
  }

  // Replay Button
  const btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      playSfx('click');
      resetGame();
    });
  }

  // Sound Toggle Button
  const btnMute = document.getElementById('btn-mute');
  if (btnMute) {
    btnMute.addEventListener('click', () => {
      initAudio();
      const muted = toggleMute();
      btnMute.textContent = muted ? '♪ BGM: OFF' : '♪ BGM: ON';
      if (!muted) {
        playSfx('click');
      }
    });
  }

  // CRT Scanlines Toggle Button
  const btnCrt = document.getElementById('btn-crt');
  const crtOverlay = document.getElementById('crt-overlay');
  if (btnCrt && crtOverlay) {
    btnCrt.addEventListener('click', () => {
      playSfx('click');
      crtOverlay.classList.toggle('crt-off');
      const isOff = crtOverlay.classList.contains('crt-off');
      btnCrt.textContent = isOff ? 'CRT: OFF' : 'CRT: ON';
    });
  }

  // Keyboard Navigation: Space / Enter activates primary action
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (currentScreen === 'screen-start' && btnStart) {
        e.preventDefault();
        btnStart.click();
      } else if (currentScreen === 'screen-cake' && btnBlow && !isBlowing) {
        e.preventDefault();
        btnBlow.click();
      }
    }
  });
}

// Auto-boot on browser load
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}

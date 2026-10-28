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
  baseLevel: 21,
  level: 22,
  expGained: 1505,
  themeColor: '#00f5ff',
  wishes: [
    "Chúc mừng sinh nhật lần thứ 22 của Thu Thùy!",
    "Bước sang tuổi mới, chúc bạn luôn giữ nụ cười rạng rỡ, ngập tràn năng lượng tích cực và luôn hạnh phúc.",
    "Chúc mọi dự định và ước mơ của bạn trong năm nay đều sẽ nở hoa rực rỡ như những hạt pháo hoa pixel này!",
    "Mong rằng mỗi ngày của bạn đều là một màn chơi thật vui vẻ, bình yên và ngập tràn may mắn. 💙",
    "LEVEL UP SUCCESSFUL! Happy Birthday, Thu Thùy!"
  ]
};

// Player authentication constants
export const AUTH_CREDENTIALS = {
  username: 'thuthuy',
  password: 'xinhdep',
  sessionDurationMs: 60 * 60 * 1000 // 1 hour in ms
};

export const AUTH_STORAGE_KEY = 'hpbd_player_auth';

/**
 * Check if active session exists and is within 1-hour window
 */
export function checkAuthSession() {
  if (typeof localStorage === 'undefined') return true;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session || !session.timestamp) return false;
    const now = Date.now();
    const elapsed = now - session.timestamp;
    if (elapsed >= 0 && elapsed < AUTH_CREDENTIALS.sessionDurationMs) {
      return true;
    }
    // Expired: clean up
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Attempt player login
 */
export function login(username, password) {
  const userValid = username && username.trim().toLowerCase() === AUTH_CREDENTIALS.username.toLowerCase();
  const passValid = password && password.trim().toLowerCase() === AUTH_CREDENTIALS.password.toLowerCase();

  if (userValid && passValid) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          username: AUTH_CREDENTIALS.username,
          timestamp: Date.now()
        }));
      } catch (_) {}
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'Sai Username hoặc Password rồi! Thử lại nhé 🎮'
  };
}

let currentScreen = 'screen-start';
let isBlowing = false;
let typewriterTimeouts = [];
let cakePromptTimeouts = [];
let levelUpTimeouts = [];

// Quest Definitions
export const QUESTS = [
  { id: 1, key: 'gift', title: 'Tìm cách mở hộp quà 🎁' },
  { id: 2, key: 'lights', title: 'Tìm cách tắt đèn phòng 💡' },
  { id: 3, key: 'wish', title: 'Ước một điều ước thật đẹp ✉️' },
  { id: 4, key: 'candles', title: 'Tìm cách thổi tắt nến trong phòng tối 🕯️' },
  { id: 5, key: 'complete', title: 'Tất cả nhiệm vụ đã hoàn thành! 🏆' }
];

let currentQuestIndex = 0;
let isBoxOpened = false;
let isLightsOff = false;
let hasTurnedOffLightsFirstTime = false;
let hasLetterFallen = false;
let userWishText = '';
let isWishSubmitted = false;
let candlesBlownState = { 1: false, 2: false, 3: false };
let toastTimeout = null;
let toastDismissTimeout = null;
let questTypewriterTimeout = null;
let questTransitionTimeout = null;
let isQuestTextTyping = false;
let pendingToast = null;

/**
 * Clear any pending quest transition animation timer
 */
export function clearQuestTransition() {
  if (questTransitionTimeout) {
    clearTimeout(questTransitionTimeout);
    questTransitionTimeout = null;
  }
}

/**
 * Get the current active quest
 */
export function getCurrentQuest() {
  return QUESTS[Math.min(currentQuestIndex, QUESTS.length - 1)];
}

/**
 * Update Quest Tracker HUD UI with typewriter reveal and sound effect
 * @param {Function} [onComplete] Callback invoked when quest text finishes typing
 */
export function updateQuestUI(onComplete) {
  const quest = getCurrentQuest();

  if (typeof document === 'undefined') {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const questEl = document.getElementById('quest-text');
  const numEl = document.getElementById('quest-number');
  const trackerBox = document.getElementById('quest-tracker');

  if (numEl) {
    numEl.textContent = currentQuestIndex < 4 ? `${currentQuestIndex + 1}/4` : '4/4 ✓';
  }

  if (trackerBox) {
    trackerBox.classList.remove('quest-flash');
    void trackerBox.offsetWidth; // Trigger reflow for animation restart
    trackerBox.classList.add('quest-flash');
  }

  if (!questEl) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  if (questTypewriterTimeout) {
    clearTimeout(questTypewriterTimeout);
    questTypewriterTimeout = null;
  }

  isQuestTextTyping = true;
  questEl.textContent = '';
  const characters = Array.from(quest.title);
  let charIdx = 0;
  const speed = 55; // Relaxed JRPG typing speed for comfortable reading

  function typeChar() {
    if (charIdx < characters.length) {
      const char = characters[charIdx];
      charIdx++;
      questEl.textContent = characters.slice(0, charIdx).join('');
      if (char !== ' ' && char !== '\n') {
        playSfx('text');
      }
      questTypewriterTimeout = setTimeout(typeChar, speed);
    } else {
      isQuestTextTyping = false;
      questTypewriterTimeout = null;
      if (typeof onComplete === 'function') {
        onComplete();
      }
      // If a toast was waiting for quest text to finish, display it now
      if (pendingToast) {
        const { msg, opts } = pendingToast;
        pendingToast = null;
        showToast(msg, opts);
      }
    }
  }

  typeChar();
}

/**
 * Clear any active toast message
 */
export function clearToast() {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  if (toastDismissTimeout) {
    clearTimeout(toastDismissTimeout);
    toastDismissTimeout = null;
  }
  pendingToast = null;
  if (typeof document !== 'undefined') {
    const toast = document.getElementById('quest-toast');
    if (toast) {
      toast.classList.remove('visible');
      toast.textContent = '';
      toast.style.removeProperty('display');
    }
  }
}

/**
 * Show a retro floating toast with cake-prompt style
 * @param {string} msg Toast message text
 * @param {Object} [options] Options: duration, type ('gold'|'error'|'normal'), onDismiss
 */
export function showToast(msg, options = {}) {
  const { duration = 2400, type = 'normal', onDismiss = null } = options;

  // Rule: If quest text is currently typing, wait until quest text finishes typing
  if (isQuestTextTyping) {
    pendingToast = { msg, opts: options };
    return;
  }

  if (typeof document === 'undefined') {
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
    return;
  }

  const toast = document.getElementById('quest-toast');
  if (!toast) {
    if (typeof onDismiss === 'function') onDismiss();
    return;
  }

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  if (toastDismissTimeout) {
    clearTimeout(toastDismissTimeout);
    toastDismissTimeout = null;
  }

  toast.textContent = msg;
  toast.className = 'quest-toast';
  toast.style.removeProperty('display');
  if (type === 'gold') {
    toast.classList.add('toast-gold');
  } else if (type === 'error') {
    toast.classList.add('toast-error');
  }
  void toast.offsetWidth;
  toast.classList.add('visible');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
    toastDismissTimeout = setTimeout(() => {
      toast.textContent = '';
      toast.style.removeProperty('display');
      if (typeof onDismiss === 'function') {
        onDismiss();
      }
    }, 380); // Wait for transition fade out
  }, duration);
}

/**
 * Quest 1: Open the Gift Box to reveal the cake
 */
export function openGiftBox() {
  if (isBoxOpened) return { success: false, reason: 'already_opened' };
  isBoxOpened = true;
  playSfx('chime');

  if (typeof document !== 'undefined') {
    const giftBox = document.getElementById('pixel-gift-box');
    const cakeDisplay = document.getElementById('cake-display');
    const lightSwitch = document.getElementById('pixel-light-switch');

    if (giftBox) {
      giftBox.classList.add('opening');
      setTimeout(() => {
        giftBox.style.display = 'none';
        if (cakeDisplay) {
          cakeDisplay.style.display = 'flex';
          cakeDisplay.classList.add('revealed');
        }
      }, 500);
    }

    if (lightSwitch) {
      lightSwitch.classList.remove('locked');
      lightSwitch.title = 'Chạm để bật/tắt đèn';
    }
  }

  if (currentQuestIndex === 0) {
    // Wait until gift box lid flies off (500ms) and cake finishes reveal animation (600ms) -> 1100ms
    if (typeof document === 'undefined') {
      currentQuestIndex = 1;
      playSfx('coin');
      updateQuestUI();
    } else {
      clearQuestTransition();
      questTransitionTimeout = setTimeout(() => {
        if (currentScreen === 'screen-cake' && currentQuestIndex === 0) {
          currentQuestIndex = 1;
          playSfx('coin');
          updateQuestUI();
        }
      }, 1100);
    }
  }

  return { success: true };
}

/**
 * Quest 2: Toggle room light switch
 */
export function toggleLights() {
  if (!isBoxOpened) {
    showToast('Hãy mở hộp quà trước đã nhé! 🎁', { type: 'error' });
    playSfx('error');
    return { success: false, reason: 'box_not_opened' };
  }

  isLightsOff = !isLightsOff;
  playSfx('click');

  if (typeof document !== 'undefined') {
    const room = document.getElementById('pixel-room');
    const toggle = document.getElementById('switch-toggle');
    if (room) {
      if (isLightsOff) {
        room.classList.add('dark-mode');
      } else {
        room.classList.remove('dark-mode');
      }
    }
    if (toggle) {
      if (isLightsOff) {
        toggle.classList.add('switched-off');
      } else {
        toggle.classList.remove('switched-off');
      }
    }
  }

  // Turning off lights for the first time unlocks Quest 3
  if (isLightsOff && !hasTurnedOffLightsFirstTime) {
    hasTurnedOffLightsFirstTime = true;
    triggerFallingLetter();

    if (currentQuestIndex === 1) {
      if (typeof document === 'undefined') {
        currentQuestIndex = 2;
        playSfx('coin');
        updateQuestUI();
      } else {
        // Wait for room to dim (500ms) and letter to float down (1000ms) -> 1100ms
        clearQuestTransition();
        questTransitionTimeout = setTimeout(() => {
          if (currentScreen === 'screen-cake' && currentQuestIndex === 1) {
            currentQuestIndex = 2;
            playSfx('coin');
            updateQuestUI();
          }
        }, 1100);
      }
    }
  }

  return { success: true, lightsOff: isLightsOff };
}

/**
 * Trigger mini wish letter dropping onto the cake table
 */
export function triggerFallingLetter() {
  hasLetterFallen = true;
  if (typeof document !== 'undefined') {
    const letter = document.getElementById('table-wish-letter');
    if (letter) {
      letter.style.display = 'flex';
      letter.classList.add('falling-letter');
    }
  }
}

/**
 * Quest 3: Open wish modal
 */
export function openWishModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('wish-modal');
  const input = document.getElementById('wish-input');
  if (modal) {
    modal.style.display = 'flex';
    if (input) {
      if (userWishText && !input.value) {
        input.value = userWishText;
      }
      input.focus();
    }
    playSfx('click');
  }
}

/**
 * Quest 3: Close wish modal
 */
export function closeWishModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('wish-modal');
  if (modal) {
    modal.style.display = 'none';
    playSfx('click');
  }
}

/**
 * Handle closing the wish modal with X button:
 * If wish is non-empty and not yet submitted, reveals the "Gửi điều ước" button without sending yet (allows user to edit).
 */
export function handleWishModalClose(overrideText) {
  let text = typeof overrideText === 'string' ? overrideText : '';
  if (typeof document !== 'undefined') {
    const input = document.getElementById('wish-input');
    if (input && typeof overrideText !== 'string') {
      text = input.value;
    }
  }

  const trimmed = text.trim();
  closeWishModal();

  if (trimmed.length > 0 && !isWishSubmitted) {
    userWishText = trimmed;
    BIRTHDAY_CONFIG.userWish = userWishText;
    if (typeof document !== 'undefined') {
      const btnSubmit = document.getElementById('btn-submit-wish');
      if (btnSubmit) {
        btnSubmit.style.display = 'inline-block';
      }
    }
    return { readyToSend: true, wish: trimmed };
  }

  return { readyToSend: false };
}

/**
 * Quest 3: Submit secret wish
 */
export function submitWish(customWish, options = {}) {
  if (isWishSubmitted) return { success: false, reason: 'already_submitted' };

  let wish = typeof customWish === 'string' ? customWish.trim() : userWishText;
  if (!wish && typeof document !== 'undefined') {
    const input = document.getElementById('wish-input');
    if (input) wish = input.value.trim();
  }

  if (!wish) {
    showToast('Hãy viết điều ước của bạn trước khi gửi nhé! ✍️', { type: 'error' });
    playSfx('error');
    return { success: false, reason: 'empty_wish' };
  }

  userWishText = wish;
  BIRTHDAY_CONFIG.userWish = userWishText;
  isWishSubmitted = true;
  playSfx('chime');

  if (typeof document !== 'undefined') {
    const modal = document.getElementById('wish-modal');
    if (modal) modal.style.display = 'none';

    const btnSubmit = document.getElementById('btn-submit-wish');
    if (btnSubmit) btnSubmit.style.display = 'none';

    const letter = document.getElementById('table-wish-letter');
    if (letter) {
      letter.classList.add('flying-to-window');
      setTimeout(() => {
        letter.style.display = 'none';
      }, 900);
    }
  }

  // Toast and Quest mutual exclusivity:
  // Show toast "Ước nguyện đã được gửi gắm vào các vì sao! ✨"
  // ONLY when this toast dismisses/fades out does Quest 4 activate!
  const handleQuestAdvance = () => {
    if (currentQuestIndex === 2) {
      currentQuestIndex = 3;
      playSfx('coin');
      updateQuestUI();
    }
    if (options && typeof options.onToastDismiss === 'function') {
      options.onToastDismiss();
    }
  };

  showToast('Ước nguyện đã được gửi gắm vào các vì sao! ✨', {
    type: 'gold',
    duration: 2500,
    onDismiss: handleQuestAdvance
  });

  return { success: true, wish: userWishText };
}

/**
 * Quest 4: Blow an individual candle
 */
export function blowIndividualCandle(candleNumber) {
  const num = Number(candleNumber);
  if (!isWishSubmitted) {
    showToast('Hãy ước và gửi điều ước trước khi thổi nến nhé! ✉️', { type: 'error' });
    playSfx('error');
    return { success: false, reason: 'wish_not_submitted' };
  }

  if (!isLightsOff) {
    showToast('Hãy tắt đèn phòng trước khi thổi nến nhé! 💡', { type: 'error' });
    playSfx('error');
    return { success: false, reason: 'lights_are_on' };
  }

  if (candlesBlownState[num]) {
    return { success: false, reason: 'already_blown' };
  }

  candlesBlownState[num] = true;
  playSfx('blow');

  if (typeof document !== 'undefined') {
    const candleEl = document.querySelector(`.pixel-candle.candle-${num}`);
    if (candleEl) {
      candleEl.classList.add('extinguished');
    }
  }

  const blownCount = Object.values(candlesBlownState).filter(Boolean).length;
  if (blownCount === 3) {
    isBlowing = true;
    currentQuestIndex = 4;
    updateQuestUI();

    showToast('Tất cả nến đã tắt! Điều ước sẽ thành hiện thực! ✨', {
      type: 'gold',
      duration: 2400
    });

    // Start celebration & transition to letter
    playSfx('firework');
    startFireworks(6000);

    const t = setTimeout(() => {
      if (currentScreen === 'screen-cake') {
        switchScreen('screen-letter');
        triggerLevelUp(() => {
          runTypewriter();
        });
      }
    }, 2400);
    typewriterTimeouts.push(t);

    return { success: true, allBlown: true };
  }

  return { success: true, allBlown: false, blownCount };
}

/**
 * Reset all quest states
 */
export function resetQuests() {
  currentQuestIndex = 0;
  isBoxOpened = false;
  isLightsOff = false;
  hasTurnedOffLightsFirstTime = false;
  hasLetterFallen = false;
  userWishText = '';
  isWishSubmitted = false;
  candlesBlownState = { 1: false, 2: false, 3: false };
  isBlowing = false;
  clearToast();
  clearQuestTransition();
  if (questTypewriterTimeout) {
    clearTimeout(questTypewriterTimeout);
    questTypewriterTimeout = null;
  }
  isQuestTextTyping = false;
  pendingToast = null;

  if (typeof document !== 'undefined') {
    const giftBox = document.getElementById('pixel-gift-box');
    if (giftBox) {
      giftBox.style.display = 'flex';
      giftBox.classList.remove('opening');
    }

    const cakeDisplay = document.getElementById('cake-display');
    if (cakeDisplay) {
      cakeDisplay.style.display = 'none';
      cakeDisplay.classList.remove('revealed');
    }

    const lightSwitch = document.getElementById('pixel-light-switch');
    if (lightSwitch) {
      lightSwitch.classList.add('locked');
      lightSwitch.title = 'Công tắc đèn (Chưa mở khóa)';
    }

    const switchToggle = document.getElementById('switch-toggle');
    if (switchToggle) {
      switchToggle.classList.remove('switched-off');
    }

    const room = document.getElementById('pixel-room');
    if (room) {
      room.classList.remove('dark-mode');
    }

    const letter = document.getElementById('table-wish-letter');
    if (letter) {
      letter.style.display = 'none';
      letter.classList.remove('falling-letter', 'flying-to-window');
    }

    const modal = document.getElementById('wish-modal');
    if (modal) modal.style.display = 'none';

    const input = document.getElementById('wish-input');
    if (input) input.value = '';

    const btnSubmit = document.getElementById('btn-submit-wish');
    if (btnSubmit) btnSubmit.style.display = 'none';

    const promptEl = document.getElementById('cake-prompt');
    if (promptEl) {
      promptEl.style.display = 'none';
      promptEl.textContent = '';
    }

    clearToast();

    const candles = document.querySelectorAll('.pixel-candle');
    candles.forEach(c => c.classList.remove('extinguished'));

    updateQuestUI();
  }
}

/**
 * Get current active screen ID
 */
export function getCurrentScreen() {
  return currentScreen;
}

/**
 * Switch game screen with smooth transition
 * @param {'screen-login' | 'screen-start' | 'screen-cake' | 'screen-letter'} targetScreenId
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

  // Manage BGM per screen: ONLY play on cake and letter screens!
  if (targetScreenId === 'screen-cake' || targetScreenId === 'screen-letter') {
    playBgm();
  } else {
    stopBgm();
  }

  // Update HUD controls: hide logout button on login screen
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.style.display = (targetScreenId === 'screen-login') ? 'none' : 'inline-block';
  }
}

/**
 * Clear all typewriter timers to prevent overlapping
 */
export function clearTypewriter() {
  typewriterTimeouts.forEach(t => clearTimeout(t));
  typewriterTimeouts = [];
}

/**
 * Clear cake prompt typewriter timers
 */
export function clearCakePrompt() {
  cakePromptTimeouts.forEach(t => clearTimeout(t));
  cakePromptTimeouts = [];
}

/**
 * Clear level up sequence timers
 */
export function clearLevelUp() {
  levelUpTimeouts.forEach(t => clearTimeout(t));
  levelUpTimeouts = [];
}

/**
 * Typewriter effect for the cake prompt text; disables blow button until finished
 */
export function typeCakePrompt() {
  if (typeof document === 'undefined') return;
  const promptEl = document.getElementById('cake-prompt');
  const btnBlow = document.getElementById('btn-blow');
  if (!promptEl) return;

  clearCakePrompt();
  promptEl.textContent = '';
  promptEl.style.color = 'var(--cyan-soft)';

  if (btnBlow) {
    btnBlow.disabled = true;
    btnBlow.style.opacity = '0.5';
    btnBlow.style.cursor = 'not-allowed';
  }

  const promptText = 'Hãy ước một điều ước thật đẹp và thổi nến nhé!';
  const characters = Array.from(promptText);
  let charIndex = 0;
  const speed = 38;

  function typeChar() {
    if (currentScreen !== 'screen-cake') return;
    if (charIndex < characters.length) {
      const char = characters[charIndex];
      charIndex++;
      promptEl.textContent = characters.slice(0, charIndex).join('');
      if (char !== ' ' && char !== '\n') {
        playSfx('text');
      }
      const t = setTimeout(typeChar, speed);
      cakePromptTimeouts.push(t);
    } else {
      // Completed typing: enable blow button with sound feedback
      if (btnBlow && !isBlowing && currentScreen === 'screen-cake') {
        btnBlow.disabled = false;
        btnBlow.style.opacity = '1';
        btnBlow.style.cursor = 'pointer';
        playSfx('click');
      }
    }
  }

  typeChar();
}

/**
 * Run 8-bit typewriter effect for the birthday letter with paragraph pauses & SFX
 */
export function runTypewriter() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('letter-content');
  if (!container) return;

  clearTypewriter();
  container.textContent = '';

  const paragraphs = [...BIRTHDAY_CONFIG.wishes];
  if (BIRTHDAY_CONFIG.userWish) {
    paragraphs.splice(3, 0, `🌟 Điều ước của Thu Thùy: "${BIRTHDAY_CONFIG.userWish}" — Ước nguyện đã gửi gắm vào các vì sao, chúc điều ước này sớm thành hiện thực nhé! ✨`);
  }

  const charSpeed = 35; // ms per character
  const paragraphPause = 750; // ms pause between paragraphs

  function typeParagraph(idx) {
    if (currentScreen !== 'screen-letter') return;
    if (idx >= paragraphs.length) {
      return;
    }

    const currentParagraph = paragraphs[idx];
    const characters = Array.from(currentParagraph);
    let charIndex = 0;

    function typeChar() {
      if (currentScreen !== 'screen-letter') return;
      if (charIndex < characters.length) {
        const char = characters[charIndex];
        charIndex++;

        const previousText = paragraphs.slice(0, idx).join('\n\n') + (idx > 0 ? '\n\n' : '');
        const currentTyped = characters.slice(0, charIndex).join('');
        container.textContent = previousText + currentTyped;

        if (char !== ' ' && char !== '\n') {
          playSfx('text');
        }

        const t = setTimeout(typeChar, charSpeed);
        typewriterTimeouts.push(t);
      } else {
        // Finished current paragraph
        if (idx < paragraphs.length - 1) {
          if (currentScreen === 'screen-letter') {
            playSfx('pause');
            const t = setTimeout(() => {
              typeParagraph(idx + 1);
            }, paragraphPause);
            typewriterTimeouts.push(t);
          }
        } else {
          // All paragraphs completed
          if (currentScreen === 'screen-letter') {
            playSfx('chime');
          }
        }
      }
    }

    typeChar();
  }

  typeParagraph(0);
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
    if (currentScreen === 'screen-cake') {
      switchScreen('screen-letter');
      triggerLevelUp(() => {
        runTypewriter();
      });
    }
  }, 2400);
  typewriterTimeouts.push(t);
}

/**
 * Trigger Level Up animation banner & HUD badge update
 * @param {Function} [onComplete] Callback fired after level up animation completes
 */
export function triggerLevelUp(onComplete) {
  clearLevelUp();
  playSfx('levelup');

  if (typeof document === 'undefined') return;

  const banner = document.getElementById('levelup-banner');
  if (banner) {
    banner.classList.add('show');
  }

  // Vertical rolling level animation: waits for EXP bar to fill, then rolls up!
  const roller = document.getElementById('level-roller');
  if (roller) {
    const tRoller = setTimeout(() => {
      if (currentScreen === 'screen-letter') {
        roller.classList.add('rolled');
        playSfx('coin');
      }
    }, 1200);
    levelUpTimeouts.push(tRoller);
  }

  const hudLevel = document.getElementById('hud-level');
  if (hudLevel) {
    hudLevel.classList.add('level-up-flash');
    const tHud = setTimeout(() => {
      if (currentScreen === 'screen-letter') {
        hudLevel.textContent = `LEVEL: ${BIRTHDAY_CONFIG.level}`;
      }
    }, 1200);
    levelUpTimeouts.push(tHud);
  }

  // Wait until level up banner animation sequence finishes before callback
  const tDone = setTimeout(() => {
    if (currentScreen === 'screen-letter' && typeof onComplete === 'function') {
      onComplete();
    }
  }, 2500);
  levelUpTimeouts.push(tDone);
}

/**
 * Stop and clean up all ongoing sounds, fireworks, and animation timers
 */
export function stopAllEffects() {
  isBlowing = false;
  clearTypewriter();
  clearCakePrompt();
  clearLevelUp();
  stopFireworks();
  stopBgm();
  resetQuests();

  if (typeof document === 'undefined') return;

  // Reset candle visuals
  const candles = document.querySelectorAll('.pixel-candle');
  candles.forEach(candle => {
    candle.classList.remove('extinguished');
  });

  // Reset blow button
  const btnBlow = document.getElementById('btn-blow');
  if (btnBlow) {
    btnBlow.disabled = true;
    btnBlow.style.opacity = '0.5';
    btnBlow.style.cursor = 'not-allowed';
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
    container.textContent = '';
  }

  // Reset Level Up banner, vertical roller & HUD
  const banner = document.getElementById('levelup-banner');
  if (banner) {
    banner.classList.remove('show');
  }

  const roller = document.getElementById('level-roller');
  if (roller) {
    roller.classList.remove('rolled');
  }

  const hudLevel = document.getElementById('hud-level');
  if (hudLevel) {
    hudLevel.textContent = `LEVEL: ${BIRTHDAY_CONFIG.baseLevel}`;
    hudLevel.classList.remove('level-up-flash');
  }
}

/**
 * Player logout - halts all sound/effects and returns to login screen
 */
export function logout() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (_) {}
  }
  stopAllEffects();
  switchScreen('screen-login');
}

/**
 * Reset game to initial start screen
 */
export function resetGame() {
  stopAllEffects();
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

  // Check 1-hour session on startup
  if (!checkAuthSession()) {
    switchScreen('screen-login');
  } else {
    switchScreen('screen-start');
  }

  // Player Login Form handling
  const loginForm = document.getElementById('login-form');
  const inputUsername = document.getElementById('login-username');
  const inputPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = inputUsername ? inputUsername.value : '';
      const pass = inputPassword ? inputPassword.value : '';
      const res = login(user, pass);
      if (res.success) {
        initAudio();
        playSfx('coin');
        if (loginError) loginError.textContent = '';
        if (inputPassword) inputPassword.value = '';
        switchScreen('screen-start');
      } else {
        initAudio();
        playSfx('error');
        if (loginError) {
          loginError.textContent = res.error;
          loginError.classList.add('error-shake');
          setTimeout(() => loginError.classList.remove('error-shake'), 400);
        }
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      playSfx('click');
      logout();
    });
  }

  // Start Screen Button
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      initAudio();
      playSfx('coin');
      resetQuests();
      switchScreen('screen-cake');
    });
  }

  // Interactive Quest 1: Gift box click
  const giftBox = document.getElementById('pixel-gift-box');
  if (giftBox) {
    giftBox.addEventListener('click', () => {
      openGiftBox();
    });
  }

  // Interactive Quest 2: Light switch click
  const lightSwitch = document.getElementById('pixel-light-switch');
  if (lightSwitch) {
    lightSwitch.addEventListener('click', () => {
      toggleLights();
    });
  }

  // Interactive Quest 3: Table Wish Letter & Modal
  const tableLetter = document.getElementById('table-wish-letter');
  if (tableLetter) {
    tableLetter.addEventListener('click', () => {
      openWishModal();
    });
  }

  const btnCloseWish = document.getElementById('btn-close-wish');
  if (btnCloseWish) {
    btnCloseWish.addEventListener('click', () => {
      handleWishModalClose();
    });
  }

  const btnSubmitWish = document.getElementById('btn-submit-wish');
  if (btnSubmitWish) {
    btnSubmitWish.addEventListener('click', () => {
      submitWish();
    });
  }

  // Interactive Quest 4: Individual Candle click
  const candleEls = document.querySelectorAll('.pixel-candle');
  candleEls.forEach(c => {
    c.addEventListener('click', () => {
      const num = c.getAttribute('data-candle');
      if (num) {
        blowIndividualCandle(num);
      }
    });
  });

  // Blow Candle Button (legacy / fallback)
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
      } else if (currentScreen === 'screen-cake' && btnBlow && !isBlowing && !btnBlow.disabled) {
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

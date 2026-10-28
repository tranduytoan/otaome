/**
 * Happy Birthday Thu Thùy - Web Audio API 8-Bit Chiptune Synthesizer
 * Zero dependencies, pure Web Audio oscillators & synthetic sound effects
 */

// Note frequency map (in Hz)
export const NOTE_FREQ = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99,
  'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
  'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'E6': 1318.51
};

// Happy Birthday melody sequence: [note, duration in beats]
export const HAPPY_BIRTHDAY_NOTES = [
  { note: 'G4', dur: 0.75 },
  { note: 'G4', dur: 0.25 },
  { note: 'A4', dur: 1.0 },
  { note: 'G4', dur: 1.0 },
  { note: 'C5', dur: 1.0 },
  { note: 'B4', dur: 2.0 },

  { note: 'G4', dur: 0.75 },
  { note: 'G4', dur: 0.25 },
  { note: 'A4', dur: 1.0 },
  { note: 'G4', dur: 1.0 },
  { note: 'D5', dur: 1.0 },
  { note: 'C5', dur: 2.0 },

  { note: 'G4', dur: 0.75 },
  { note: 'G4', dur: 0.25 },
  { note: 'G5', dur: 1.0 },
  { note: 'E5', dur: 1.0 },
  { note: 'C5', dur: 1.0 },
  { note: 'B4', dur: 1.0 },
  { note: 'A4', dur: 1.0 },

  { note: 'F5', dur: 0.75 },
  { note: 'F5', dur: 0.25 },
  { note: 'E5', dur: 1.0 },
  { note: 'C5', dur: 1.0 },
  { note: 'D5', dur: 1.0 },
  { note: 'C5', dur: 2.5 }
];

let audioCtx = null;
let masterGain = null;
let muted = false;
let isPlayingBgm = false;
let bgmTimer = null;
let currentBgmNodes = [];

/**
 * Initialize AudioContext upon user gesture
 */
export function initAudio() {
  if (typeof window === 'undefined') return false;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(muted ? 0 : 0.25, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return Boolean(audioCtx);
}

/**
 * Check if sound is muted
 */
export function isMuted() {
  return muted;
}

/**
 * Toggle mute state
 */
export function toggleMute() {
  muted = !muted;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(muted ? 0 : 0.25, audioCtx.currentTime);
  }
  return muted;
}

/**
 * Play a single chiptune tone with square wave and ADSR envelope
 */
function playTone(freq, startTime, duration) {
  if (!audioCtx || !masterGain) return null;

  const osc = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, startTime);

  // 8-bit envelope (Fast attack, short decay)
  const attack = 0.02;
  const decay = duration * 0.9;
  
  noteGain.gain.setValueAtTime(0, startTime);
  noteGain.gain.linearRampToValueAtTime(0.6, startTime + attack);
  noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + attack + decay);

  osc.connect(noteGain);
  noteGain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration);

  return osc;
}

/**
 * Play the 8-bit Happy Birthday melody in loop
 */
export function playBgm() {
  if (isPlayingBgm) return;
  if (!initAudio()) return;

  isPlayingBgm = true;
  scheduleMelodyLoop();
}

function scheduleMelodyLoop() {
  if (!isPlayingBgm || !audioCtx) return;

  stopCurrentBgmNodes();

  const bpm = 120;
  const beatSec = 60 / bpm;
  let cursor = audioCtx.currentTime + 0.1;

  HAPPY_BIRTHDAY_NOTES.forEach(item => {
    const freq = NOTE_FREQ[item.note];
    const duration = item.dur * beatSec;
    if (freq) {
      const node = playTone(freq, cursor, duration * 0.88);
      if (node) currentBgmNodes.push(node);
    }
    cursor += duration;
  });

  const totalDuration = (cursor - audioCtx.currentTime) * 1000;
  bgmTimer = setTimeout(() => {
    if (isPlayingBgm) {
      scheduleMelodyLoop();
    }
  }, totalDuration + 500);
}

function stopCurrentBgmNodes() {
  currentBgmNodes.forEach(node => {
    try { node.stop(); } catch (_) {}
  });
  currentBgmNodes = [];
}

/**
 * Stop background music
 */
export function stopBgm() {
  isPlayingBgm = false;
  if (bgmTimer) {
    clearTimeout(bgmTimer);
    bgmTimer = null;
  }
  stopCurrentBgmNodes();
}

/**
 * Play retro 8-bit sound effects
 * @param {'coin' | 'blow' | 'firework' | 'chime' | 'click'} type
 */
export function playSfx(type) {
  if (!initAudio() || !audioCtx || !masterGain || muted) return;

  const now = audioCtx.currentTime;

  switch (type) {
    case 'coin': {
      // Classic arcade coin pickup (B5 -> E6)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(NOTE_FREQ['B5'], now);
      osc.frequency.setValueAtTime(NOTE_FREQ['E6'], now + 0.08);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
      break;
    }

    case 'blow': {
      // Noise buffer simulating blowing out a candle
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(100, now + 0.4);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
      break;
    }

    case 'firework': {
      // Pop and burst sound
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }

    case 'chime': {
      // Ascending celebratory chiptune arpeggio
      const notes = ['C5', 'E5', 'G5', 'C6'];
      notes.forEach((n, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(NOTE_FREQ[n], now + idx * 0.09);

        gain.gain.setValueAtTime(0.4, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.25);
      });
      break;
    }

    case 'levelup': {
      // Classic RPG fanfare: G4 -> C5 -> E5 -> G5 -> C6
      const fanfare = ['G4', 'C5', 'E5', 'G5', 'C6'];
      fanfare.forEach((n, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(NOTE_FREQ[n], now + idx * 0.08);

        gain.gain.setValueAtTime(0.45, now + idx * 0.08);
        const noteDur = (idx === fanfare.length - 1) ? 0.45 : 0.12;
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + noteDur);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + noteDur);
      });
      break;
    }

    case 'click':
    default: {
      // Short blip
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
      break;
    }
  }
}

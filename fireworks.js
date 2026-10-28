/**
 * Happy Birthday Thu Thùy - Canvas Pixel Fireworks & Confetti Engine
 * Square pixel particles, gravity, trail decay & cyan/gold retro palette
 */

export const PIXEL_PALETTE = [
  '#00f5ff', // Cyan primary
  '#5ce1e6', // Cyan light
  '#a0f0ed', // Soft cyan
  '#ffd166', // Gold star
  '#ffffff', // White pixel
  '#ff70a6', // Pink accent
  '#00c4cc'  // Deep cyan
];

let canvas = null;
let ctx = null;
let particles = [];
let animFrameId = null;
let autoBurstInterval = null;
let isRunning = false;

/**
 * Pixel Particle Representation
 */
class PixelParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    
    // Pixel particle size (authentic 8-bit chunky squares)
    this.size = Math.floor(Math.random() * 3) + 4; // 4px, 5px, or 6px
    
    // Explosion velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.gravity = 0.08;
    this.drag = 0.96;
    this.alpha = 1.0;
    this.decay = Math.random() * 0.015 + 0.01;
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(context) {
    if (!context || this.alpha <= 0) return;
    context.save();
    context.globalAlpha = Math.max(0, this.alpha);
    context.fillStyle = this.color;
    // Math.floor ensures sharp pixel grid alignment
    context.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    context.restore();
  }
}

/**
 * Resize canvas to match window
 */
function resizeCanvas() {
  if (!canvas || typeof window === 'undefined') return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
  }
}

/**
 * Initialize Fireworks engine with canvas element
 */
export function initFireworks(canvasElement) {
  if (!canvasElement || typeof window === 'undefined') {
    canvas = null;
    ctx = null;
    return;
  }

  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  resizeCanvas();

  window.removeEventListener('resize', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
}

/**
 * Trigger an instantaneous burst of pixel particles at (x, y)
 */
export function triggerBurst(x, y) {
  if (!canvas) return;

  const originX = x ?? (Math.random() * (canvas.width * 0.7) + canvas.width * 0.15);
  const originY = y ?? (Math.random() * (canvas.height * 0.45) + canvas.height * 0.15);

  const count = 55;
  for (let i = 0; i < count; i++) {
    const color = PIXEL_PALETTE[Math.floor(Math.random() * PIXEL_PALETTE.length)];
    particles.push(new PixelParticle(originX, originY, color));
  }
}

/**
 * Animation loop
 */
function loop() {
  if (!ctx || !canvas) return;

  // Clear canvas for crisp pixel frames
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  if (isRunning || particles.length > 0) {
    animFrameId = requestAnimationFrame(loop);
  }
}

/**
 * Start spawning fireworks bursts
 * @param {number} [durationMs] Optional duration in milliseconds
 */
export function startFireworks(durationMs) {
  if (!canvas || typeof window === 'undefined') return;

  isRunning = true;
  if (!animFrameId) {
    loop();
  }

  // Trigger initial celebration bursts
  triggerBurst(canvas.width * 0.3, canvas.height * 0.28);
  triggerBurst(canvas.width * 0.7, canvas.height * 0.25);
  setTimeout(() => triggerBurst(canvas.width * 0.5, canvas.height * 0.2), 250);

  // Periodic bursts
  if (autoBurstInterval) clearInterval(autoBurstInterval);
  autoBurstInterval = setInterval(() => {
    if (isRunning) {
      triggerBurst();
    }
  }, 600);

  // Auto stop if duration provided
  if (durationMs && durationMs > 0) {
    setTimeout(() => {
      stopFireworks();
    }, durationMs);
  }
}

/**
 * Stop fireworks spawning and clear particles
 */
export function stopFireworks() {
  isRunning = false;
  if (autoBurstInterval) {
    clearInterval(autoBurstInterval);
    autoBurstInterval = null;
  }
}

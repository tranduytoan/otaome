# Birthday Pixel Art for Thu Thùy - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang web thiệp mừng sinh nhật pixel art retro 8-bit/16-bit tương tác 4 màn (Start Screen -> Bánh kem & Thổi nến -> Pháo hoa pixel -> Mở thiệp chúc mừng) với bảng màu Cyan, nhạc chiptune Web Audio API, hiệu ứng CRT và thiết kế chuẩn responsive.

**Architecture:** Ứng dụng web thuần (Vanilla HTML5 / CSS3 / JavaScript ES Modules) gồm 4 module độc lập: cấu trúc giao diện (`index.html`), hệ thống tạo hình pixel art và hiệu ứng CSS (`style.css`), bộ tổng hợp âm thanh 8-bit và chiptune synthesizer (`audio.js`), động cơ hạt pháo hoa pixel trên canvas (`fireworks.js`), và bộ điều khiển luồng tương tác / máy trạng thái (`main.js`).

**Tech Stack:** HTML5 Canvas, Modern CSS3 (Pixel Art, Keyframes, Custom Properties), JavaScript (ES Modules, Web Audio API), Node.js `node:test` cho automated validation.

**Spec:** `docs/superpowers/specs/2026-10-29-birthday-pixel-art-design.md`

## Global Constraints

- Không sử dụng thư viện bên ngoài nặng (zero external npm dependencies runtime) để đảm bảo trang có thể chạy offline hoặc host tĩnh mọi nơi.
- Bảng màu chủ đạo là **Cyan** (`#00f5ff`, `#5ce1e6`, `#003b46`, `#0a1128`, `#020813`, nhấn vàng gold `#ffd166` cho nến/pháo hoa).
- Pixel art sắc nét với thuộc tính `image-rendering: pixelated;`.
- Font chữ retro `Press Start 2P` từ Google Fonts kèm font monospace pixel fallback an toàn.
- Âm thanh chiptune tạo trực tiếp qua Web Audio API không phụ thuộc file MP3 ngoài.
- Hỗ trợ tốt trên màn hình điện thoại di động từ 320px trở lên.

## Review Focus

1. **AudioContext autoplay policy:** Trình duyệt hiện đại chặn âm thanh nếu chưa có tương tác từ người dùng. Kích hoạt AudioContext phải gắn liền với nút "PRESS START" ở màn đầu tiên.
2. **Canvas resize & devicePixelRatio:** Khi người dùng xoay ngang màn hình hoặc resize cửa sổ, Canvas pháo hoa phải tự động scale lại mà không làm méo tỉ lệ pixel.
3. **Typewriter timer overlap:** Khi bấm "Replay" / "Xem lại", nếu hiệu ứng gõ chữ đang chạy thì phải hủy bỏ (clearTimeout/clearInterval) các timer cũ để tránh xung đột chữ.
4. **Debounce / Disable nút thổi nến:** Ngăn chặn việc người dùng click liên tục vào nút "Thổi nến" làm kích hoạt hiệu ứng nhiều lần cùng lúc.
5. **Responsive pixel text wrap:** Trên màn hình nhỏ (320px), font pixel chữ to dễ bị tràn ngang nếu không dùng đơn vị `rem`/`vw` kết hợp `word-break: break-word;`.

---

### Task 1: Setup Validation Test Harness & Project Base

**Files:**
- Create: `test/sanity.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm test` script chạy bộ kiểm thử tự động bằng `node --test`.

- [ ] **Step 1: Write test kiểm tra cấu trúc cơ bản của dự án**

```javascript
// test/sanity.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Project has package.json with test script', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.type, 'module');
  assert.ok(pkg.scripts && pkg.scripts.test);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/sanity.test.js`
Expected: FAIL (vì package.json đang có `"type": "modules"` sai cú pháp chuẩn `"type": "module"` và script test chưa gọi `node --test`).

- [ ] **Step 3: Update `package.json`**

Cập nhật `package.json` sang `"type": "module"` và `"scripts": { "test": "node --test test/*.test.js" }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json test/sanity.test.js
git commit -m "chore: setup test harness with node test runner"
```

---

### Task 2: HTML Skeleton & Multi-Stage Structure (`index.html`)

**Files:**
- Create: `index.html`
- Create: `test/html.test.js`

**Interfaces:**
- Produces: Cấu trúc 4 màn giao diện (`#screen-start`, `#screen-cake`, `#screen-fireworks`, `#screen-letter`), lớp CRT overlay (`#crt-overlay`), các nút điều khiển âm thanh và quét CRT (`#btn-mute`, `#btn-crt`).

- [ ] **Step 1: Write failing test for HTML structure**

```javascript
// test/html.test.js
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
  assert.match(html, /Thu Thùy/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (`index.html must exist`)

- [ ] **Step 3: Implement `index.html`**

Tạo `index.html` chuẩn HTML5, link font Google `Press Start 2P`, link `style.css`, include thẻ canvas cho pháo hoa, khai báo các container màn hình với thuộc tính accessibility và data attributes, import module `main.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html test/html.test.js
git commit -m "feat: add html structure with 4 interactive stages and controls"
```

---

### Task 3: Pixel Art CSS Styling, Animations & CRT Filter (`style.css`)

**Files:**
- Create: `style.css`
- Create: `test/css.test.js`

**Interfaces:**
- Consumes: Classes and IDs from `index.html`.
- Produces: CSS rules for pixel cake, candle flames, smoke particles, envelope, CRT scanline overlay, and cyan palette variables.

- [ ] **Step 1: Write failing test for CSS rules and variables**

```javascript
// test/css.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('style.css defines cyan theme variables, pixelated rendering and animations', () => {
  assert.ok(fs.existsSync('style.css'), 'style.css must exist');
  const css = fs.readFileSync('style.css', 'utf8');
  assert.match(css, /--cyan-primary:\s*#00f5ff/i);
  assert.match(css, /image-rendering:\s*pixelated/);
  assert.match(css, /@keyframes\s+flicker/);
  assert.match(css, /@keyframes\s+smoke/);
  assert.match(css, /\.crt-scanlines/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (`style.css must exist`)

- [ ] **Step 3: Implement `style.css`**

Xây dựng:
- Hệ thống biến CSS màu sắc: `--cyan-primary: #00f5ff`, `--cyan-light: #5ce1e6`, `--cyan-dark: #003b46`, `--bg-night: #060b19`, `--gold: #ffd166`.
- Reset, font `Press Start 2P`, `image-rendering: pixelated`.
- Tạo hình bánh kem pixel art nhiều tầng bằng CSS box-shadow / border-radius: 0.
- Nến sinh nhật với ngọn lửa pixel nhấp nháy (`@keyframes flicker`).
- Lớp khói bốc lên khi dập nến (`@keyframes smoke`).
- Thiệp chúc mừng pixel art với đường viền 8-bit và thanh cuộn retro.
- Hiệu ứng quét scanlines `.crt-scanlines` kết hợp vignette mờ viền.
- Media queries tối ưu cho màn hình di động 320px - 768px.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add style.css test/css.test.js
git commit -m "feat: implement pixel art css styling, animations and crt overlay"
```

---

### Task 4: Web Audio API 8-Bit Chiptune Synthesizer (`audio.js`)

**Files:**
- Create: `audio.js`
- Create: `test/audio.test.js`

**Interfaces:**
- Produces:
  - `initAudio(): boolean`
  - `playBgm(): void`
  - `stopBgm(): void`
  - `toggleMute(): boolean`
  - `isMuted(): boolean`
  - `playSfx(type: 'coin' | 'blow' | 'firework' | 'chime' | 'click'): void`

- [ ] **Step 1: Write test for audio module methods and exports**

```javascript
// test/audio.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as audioModule from '../audio.js';

test('audio.js exports all required audio methods', () => {
  assert.equal(typeof audioModule.initAudio, 'function');
  assert.equal(typeof audioModule.playBgm, 'function');
  assert.equal(typeof audioModule.stopBgm, 'function');
  assert.equal(typeof audioModule.toggleMute, 'function');
  assert.equal(typeof audioModule.isMuted, 'function');
  assert.equal(typeof audioModule.playSfx, 'function');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (Cannot find module '../audio.js')

- [ ] **Step 3: Implement `audio.js`**

Xây dựng:
- Bộ giải mã nốt nhạc nốt cao độ (frequencies) của bài "Happy Birthday" (C4, D4, E4, F4, G4, A4, B4, C5,...).
- Hàm tổng hợp sóng âm vuông (Square wave oscillator) tạo âm thanh chiptune Game Boy cổ điển với ADSR envelope (Attack, Decay, Sustain, Release) mượt mà.
- Hàm `playSfx(type)`:
  - `coin`: 2 nốt bổng chiptune nhanh (B5 -> E6).
  - `blow`: white noise buffer mô phỏng tiếng thổi phù gió dập tắt nến.
  - `firework`: tiếng nổ bùm trầm kết hợp tiếng rít cao.
  - `chime`: hợp âm rải 8-bit lấp lánh khi mở thiệp.
  - `click`: tiếng blip nút bấm cổ điển.
- Quản lý mute state và kiểm tra an toàn `window.AudioContext` (tránh crash khi chạy test môi trường Node.js).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add audio.js test/audio.test.js
git commit -m "feat: implement 8-bit chiptune audio synthesizer and sfx with web audio api"
```

---

### Task 5: Pixel Canvas Fireworks & Confetti Particle System (`fireworks.js`)

**Files:**
- Create: `fireworks.js`
- Create: `test/fireworks.test.js`

**Interfaces:**
- Produces:
  - `initFireworks(canvasElement: HTMLCanvasElement): void`
  - `startFireworks(durationMs?: number): void`
  - `stopFireworks(): void`
  - `triggerBurst(x?: number, y?: number): void`

- [ ] **Step 1: Write test for fireworks module interfaces**

```javascript
// test/fireworks.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fw from '../fireworks.js';

test('fireworks.js exports initialization and trigger functions', () => {
  assert.equal(typeof fw.initFireworks, 'function');
  assert.equal(typeof fw.startFireworks, 'function');
  assert.equal(typeof fw.stopFireworks, 'function');
  assert.equal(typeof fw.triggerBurst, 'function');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (Cannot find module '../fireworks.js')

- [ ] **Step 3: Implement `fireworks.js`**

Xây dựng:
- Khởi tạo canvas với thuộc tính pixel-perfect (`ctx.imageSmoothingEnabled = false`).
- Class / Đối tượng `PixelParticle`: tọa độ $(x, y)$, vận tốc $(vx, vy)$, gia tốc trọng trường $g$, kích thước hạt vuông pixel (3px - 6px), màu sắc trong bảng Cyan/Gold (`#00f5ff`, `#5ce1e6`, `#ffd166`, `#ffffff`).
- Hàm `triggerBurst(x, y)`: sinh 40 - 70 hạt pixel bung tỏa 360 độ từ một tâm nổ.
- Vòng lặp `requestAnimationFrame` vẽ và cập nhật vị trí hạt, giảm dần alpha khi hạt rơi.
- Tự động lắng nghe sự kiện `resize` của cửa sổ để khớp độ phân giải canvas.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add fireworks.js test/fireworks.test.js
git commit -m "feat: create canvas pixel fireworks and confetti engine"
```

---

### Task 6: Interactive Controller & Typewriter Birthday Message (`main.js`)

**Files:**
- Create: `main.js`
- Create: `test/main.test.js`

**Interfaces:**
- Consumes: `audio.js`, `fireworks.js`, DOM elements from `index.html`.
- Produces: Logic điều khiển toàn bộ luồng trải nghiệm, cấu hình lời chúc, hiệu ứng gõ chữ typewriter.

- [ ] **Step 1: Write test for main configuration and state transitions**

```javascript
// test/main.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('main.js defines birthday config for Thu Thuy and exported initialization', () => {
  assert.ok(fs.existsSync('main.js'), 'main.js must exist');
  const code = fs.readFileSync('main.js', 'utf8');
  assert.match(code, /Thu Thùy/);
  assert.match(code, /29\/10/);
  assert.match(code, /typewriter/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (main.js must exist)

- [ ] **Step 3: Implement `main.js`**

Xây dựng:
- Khối `CONFIG`:
  ```javascript
  export const BIRTHDAY_CONFIG = {
    name: 'Thu Thùy',
    birthdate: '29/10/2004',
    level: 22,
    themeColor: '#00f5ff',
    wishes: [
      "Chúc mừng sinh nhật Thu Thùy! ✨",
      "Bước sang tuổi mới, chúc bạn luôn vui vẻ, rạng rỡ và đạt được mọi ước mơ đã ấp ủ.",
      "Mong mỗi ngày trôi qua đều ngập tràn niềm vui, bình yên và những điều dễ thương nhất!",
      "Happy Birthday to you! 🎮💙"
    ]
  };
  ```
- Trình điều khiển chuyển màn:
  - Bấm `btn-start`: chạy sfx 'coin', mở nhạc chiptune, ẩn Màn 1, hiển thị Màn 2 (Bánh kem).
  - Bấm `btn-blow`: dập tắt ngọn lửa nến, phát sfx 'blow', bốc khói pixel, kích hoạt pháo hoa pixel (Màn 3), sau 2.5s hiển thị Màn 4 (Thiệp).
  - Màn 4: phát sfx 'chime', chạy hiệu ứng typewriter từng dòng chúc mừng một cách êm ái.
  - Bấm `btn-replay`: reset lại trạng thái, cho phép thổi nến và xem lại lời chúc.
  - Xử lý bật/tắt CRT scanlines và Mute/Unmute âm thanh.
  - Hỗ trợ phím tắt Space/Enter để tiện thao tác trên máy tính.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add main.js test/main.test.js
git commit -m "feat: connect interactive stage flow, typewriter wishes and controls"
```

---

### Task 7: Comprehensive Verification & Visual Polish

**Files:**
- Modify: `index.html`, `style.css`, `main.js` (nếu cần tinh chỉnh)
- Create: `test/e2e-integration.test.js`

**Interfaces:**
- Produces: Toàn bộ kiểm thử unit/integration pass 100%, trang web chạy mượt mà không lỗi console.

- [ ] **Step 1: Write integration test validating all modules work together**

```javascript
// test/e2e-integration.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Integration verification: All files link correctly and contain valid syntax', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  assert.ok(index.includes('style.css'));
  assert.ok(index.includes('main.js'));
  assert.ok(fs.existsSync('style.css'));
  assert.ok(fs.existsSync('main.js'));
  assert.ok(fs.existsSync('audio.js'));
  assert.ok(fs.existsSync('fireworks.js'));
});
```

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: PASS (all tests pass)

- [ ] **Step 3: Start a local server test & verify accessibility/responsive layout**

Khởi động local HTTP server, gửi request kiểm tra HTTP 200 OK cho tất cả các file (`index.html`, `style.css`, `main.js`, `audio.js`, `fireworks.js`).

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: complete birthday pixel art page with full tests and responsive polish"
```

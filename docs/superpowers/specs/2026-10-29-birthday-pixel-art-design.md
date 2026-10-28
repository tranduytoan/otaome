# Design: Trang web mừng sinh nhật Pixel Art - Thu Thùy

## 1. Mục tiêu & Ý nghĩa (Intent & The Why)
Tạo ra một trang web thiệp mừng sinh nhật độc đáo, ấm áp và thú vị dành riêng cho **Thu Thùy** (sinh ngày 29/10/2004, màu yêu thích: **cyan**) theo phong cách retro pixel art 8-bit/16-bit hoài niệm. Trang web đem lại trải nghiệm tương tác từng bước như một tựa game arcade cổ điển: từ mở đầu, thổi nến bánh kem, bắn pháo hoa pixel đến mở phong thư chúc mừng.

## 2. Mục tiêu, Giới hạn & Chống mục tiêu (Goals, Non-Goals, Anti-Goals)
### Mục tiêu (Goals)
- **Thuần Web (Vanilla HTML5 / CSS3 / JavaScript):** Không cần cài `node_modules`, không cần build step, mở là chạy ngay trên mọi trình duyệt (cả điện thoại và máy tính).
- **Thẩm mỹ Pixel Art chuẩn retro:** 
  - Tông màu chủ đạo: **Cyan & Dark Blue** (`#00f5ff`, `#5ce1e6`, `#00e5ff`, `#0a1128`, `#020813`, điểm xuyết màu vàng gold `#ffd166` của ngọn nến và pháo hoa).
  - Font chữ pixel: Google Fonts `Press Start 2P` hoặc font pixel dự phòng sắc nét (`image-rendering: pixelated`).
  - Đồ họa pixel: Bánh sinh nhật pixel art, ngọn nến lung linh, hộp quà pixel, phong thư pixel vẽ hoàn toàn bằng CSS/SVG pixel.
  - Hiệu ứng CRT retro: Tùy chọn bật/tắt scanlines quét ngang màn hình như màn hình máy chơi game cổ điển.
- **Âm thanh Chiptune 8-bit sống động bằng Web Audio API:**
  - Tự tổng hợp giai điệu 8-bit "Happy Birthday" bằng sóng âm vuông (square wave oscillator), không phụ thuộc vào file MP3 bên ngoài (tránh lỗi 404, bản quyền hay load chậm).
  - Âm thanh hiệu ứng retro: tiếng bấm nút coin/start, tiếng thổi nến (white noise phì nhẹ), tiếng pháo hoa nổ, tiếng mở thư.
  - Nút Mute / Unmute nhạc nền và nút Bật / Tắt hiệu ứng scanlines.
- **Kịch bản tương tác 4 màn (Story Stages):**
  1. **Màn 1 - Start Screen:** Giao diện máy arcade "READY PLAYER 1", tiêu đề "LEVEL 22 / HAPPY BIRTHDAY THU THUY" nhấp nháy chữ "PRESS START". Nút này vừa tạo cảm giác vào game, vừa mở khóa AudioContext của trình duyệt.
  2. **Màn 2 - Phòng sinh nhật & Thổi nến:** Bánh kem pixel 2 tầng xinh xắn mang màu kem cyan pastel, thắp những cây nến lung linh. Nút "Thổi nến / Make a Wish" kích hoạt hiệu ứng tắt lửa, bốc làn khói pixel trắng xanh.
  3. **Màn 3 - Pháo hoa Pixel:** Màn đêm bùng nổ hàng trăm hạt pháo hoa pixel màu cyan, ngọc lam và vàng gold rực rỡ bằng HTML5 Canvas.
  4. **Màn 4 - Mở thiệp chúc mừng:** Phong thư pixel mở nắp, bức thiệp trồi lên với hiệu ứng gõ chữ typewriter từng ký tự. Để sẵn placeholder lời chúc ý nghĩa, có nút xem lại từ đầu (Replay) và sao chép link/chia sẻ.
- **Tùy biến dễ dàng:** Có phần cấu hình rõ ràng trong code để người dùng thay đổi lời chúc, ngày sinh, tên người nhận bất cứ lúc nào.

### Phi mục tiêu (Non-Goals)
- Không dùng backend / database.
- Không dùng framework nặng (React, Vue, Phaser) gây cồng kềnh cho trang thiệp đơn giản.

### Chống mục tiêu (Anti-Goals)
- Không dùng ảnh mờ, mất nét pixel (`image-rendering: auto`).
- Không tự động phát âm thanh khi chưa có tương tác người dùng (tránh bị trình duyệt chặn).
- Không để layout bị vỡ hoặc khó bấm trên màn hình điện thoại di động (tối ưu responsive từ 320px).

## 3. Các phương án kỹ thuật đã đánh giá (Approaches)
- **Phương án 1 (Đã chọn): Pure HTML5 + CSS Pixel Art + Canvas + Web Audio API.**
  - *Ưu điểm:* Nhẹ (~50KB tổng dung lượng), không phụ thuộc mạng ngoại trừ font chữ (có fallback font), mở trực tiếp bằng trình duyệt không cần máy chủ node, dễ dàng deploy lên GitHub Pages hoặc nén zip gửi tặng.
  - *Đánh đổi:* Cần viết hiệu ứng và state transition thủ công bằng JavaScript thuần, nhưng cực kỳ nhẹ và kiểm soát tối đa.
- **Phương án 2: React + Vite + Tailwind CSS.**
  - *Đánh đổi:* Phải chạy `npm build` mới ra file chạy được, người nhận không thể mở file html trực tiếp.
- **Phương án 3: Phaser / Kaboom Game Engine.**
  - *Đánh đổi:* Nặng nề, khó tối ưu việc đọc văn bản thiệp chúc trên mobile.

## 4. Kiến trúc tệp tin (File Architecture)
```text
HPBD2/
├── index.html          # Cấu trúc trang, các màn tương tác, nội dung thiệp
├── style.css           # Toàn bộ tạo hình pixel art bằng CSS, hiệu ứng animation, responsive
├── audio.js            # Trình phát nhạc 8-bit chiptune & sound effects bằng Web Audio API
├── fireworks.js        # Canvas hạt pháo hoa và confetti pixel art
├── main.js             # Quản lý luồng tương tác và hiệu ứng typewriter
└── notes.md            # Thông tin lưu trữ gốc
```

## 5. Kế hoạch triển khai chi tiết
1. Tạo `index.html` với cấu trúc màn chơi (Start -> Room/Cake -> Fireworks -> Letter) và container Canvas.
2. Viết `style.css` với bảng màu Cyan pixel art, các sprite pixel (bánh kem, nến, khói, hộp quà, phong thư), font `Press Start 2P`, hiệu ứng CRT scanline, responsive mobile.
3. Viết `audio.js` dùng Web Audio API để tạo giai điệu 8-bit Happy Birthday và các sound effects retro.
4. Viết `fireworks.js` sử dụng HTML5 Canvas để tạo hiệu ứng pháo hoa hạt vuông pixel art bung tỏa rực rỡ tông màu cyan/gold.
5. Viết `main.js` điều khiển logic chuyển cảnh, hiệu ứng thổi nến, mở thư và gõ chữ typewriter.
6. Kiểm thử và xác thực hoạt động trên trình duyệt.

- Thu Thùy
- 29/10/2004 gmt+7
- màu yêu thích: cyan

### big update: game-like features
- sau khi nhấn start, màn hình thổi nến sẽ có thêm mục `Nhiệm vụ` 
    - tối ưu UI cho cả mobile và desktop
    - có thể hiển thị từng nhiệm vụ đơn (hiển thị nhiệm vụ mới sau khi hoàn thành nhiệm vụ trước) thay vì hiển thị tất cả để tối ưu diện tích
    - loại bỏ dòng "hãy ước một điều ước thật đẹp và thổi nến" để tránh trùng lặp với nhiệm vụ
    - loại bỏ button "Thổi nến ngay" hiện tại để thêm giao diện mới
- các nhiệm vụ:
    - "Tìm cách mở hộp quà":
        - khởi đầu, hình pixel hộp quà (hiện tại) được thay bằng hình pixel hộp quà (hộp bọc bánh)
        - khi có click vào hộp quà, sẽ chạy animation pixel kéo nắp hộp đựng và hiện ra bánh sinh nhật (như hiện tại) (animation pixel bạn có thể tự vẽ cho phù hợp)
        - khi hộp được mở, đánh dấu nhiệm vụ hoàn thành
    - "Tìm cách tắt đèn":
        - thêm pixel hình switch đèn (có thể vẽ pixel animation bật/tắt đèn)
        - chỉ có thể tương tác sau khi hoàn thành nhiệm vụ mở hộp quà
        - lưu trạng thái bật/tắt đèn, có thể tồn tại ở bất kỳ trạng thái nào trong các tiến độ nhiệm vụ tiếp theo (không bị lock)
        - khi tắt đèn lần đầu tiên, đánh dấu nhiệm vụ hoàn thành
        - khi tắt đèn, giảm nhẹ độ sáng của nền sau bánh sinh nhật trong khung vuông (thay đổi màu), tăng nhẹ độ sáng cho bánh sinh nhật (thay đổi màu) (reset khi bật đèn)
    - "Ước một điều ước thật đẹp":
        - animation pixel 1 lá thư nhỏ rơi xuống cạnh bánh sinh nhật
            - chỉ trigger khi hoàn thành nhiệm vụ tắt đèn (lần đầu tiên tắt đèn)
            - giữ trạng thái kể cả khi bật đèn lại sau đó
        - bấm vào sẽ hiện lên giao diện input hình lá thư để nhập điều ước
            - có button (pixel art bạn tự design) để ẩn giao diện nhập (lá thư quay về cạnh bánh), bạn tự design để user dễ nhận ra là button ẩn giao diện nhập mà không cần chỉ dẫn
            - input enter (trên desktop hoặc bàn phím điện thoại) không liên quan tới việc ẩn lá thư
        - sau khi hoàn thành nhập điều ước lần đầu, 1 button tương tự button "thổi nến ngay" (hiện tại) sẽ xuất hiện với nội dung "gửi điều ước"
            - trước khi nhấn gửi điều ước, có thể ấn vào lá thư để sửa nội dung bao nhiêu lần cũng được
            - khi nhấn gửi điều ước, vẽ animation pixel lá thư bay tới cửa sổ và biến mất, hiện ra 1 animation pixel 1 ngôi sao nhỏ rơi xuống cạnh bánh sinh nhật (ngôi sao bạn tự vẽ pixel animation), hiển thị dòng chữ "Ước nguyện đã được gửi gắm vào các vì sao!" như hiện tại
        - khi gửi điều ước thành công, đánh dấu nhiệm vụ hoàn thành
    - "Tìm cách thổi tắt nến trong phòng tối":
        - chỉ có thể thực hiện sau khi hoàn thành nhiệm vụ gửi điều ước
        - chỉ có thể thực hiện khi đèn đang tắt
        - click vào 1 cây nến sẽ thổi tắt cây nến đó (animation pixel và sound bạn tự vẽ, có thể tái sử dụng effect hiện tại cũng được)
            - lưu trạng thái 3 cây nến riêng biệt (pixel bánh sinh nhật bạn đã vẽ có 3 nến)
            - nến đã thổi tắt sẽ không cháy lại (không còn tương tác)
            - khi đang thổi nến, nếu bật đèn thì giữ trạng thái nến, nhưng không thể thổi tiếp (yêu cầu tắt đèn)
        - khi thổi tắt hết 3 cây nến, đánh dấu nhiệm vụ hoàn thành, chờ một thời gian ngắn và chuyển sang màn hình tiếp theo


#### fix after big update
sửa các ui/ux sau:
- ở quest tracker: các text quest loại bỏ tiền tố "Nhiệm vụ: " đi và áp dụng hiệu ứng hiển thị text kèm sound effect (khi quest xuất hiện) để thu hút việc đọc của user.
- về quest-toast: 
    - tạo sẵn place holder cho quest-toast (ướm kích thước theo text dài nhất) để tránh pixel room to ra nhỏ lai mỗi lần hiện/ẩn toast
    - quy định ưu tiên quest-toast và nhiệm vụ:
        - chỉ 1 trong 2 được chiếm sự tập trung của user tại 1 thời điểm
        - nếu trigger của 1 toast thuộc về 1 nhiệm vụ thì:
            - chỉ khi toast đó ẩn đi mới được phép trigger hoành thành nhiệm vụ (quan trọng nếu toast ở cuối nhiệm vụ)
            - chỉ khi nhiệm vụ hiển thị xong (load quest text kèm hiệu ứng) thì toast mới được hiển thị
    - chỉnh style quest toast cho giống cake prompt
        - migrate tất cả cake prompt sang quest toast (hiển thị rồi biến mất)
    - loại bỏ hoặc chỉnh sửa 1 số toast (hoặc cake prompt) không cần thiết: 
        - "Hộp quà đã mở! Hãy tìm cách tắt đèn phòng nhé! 💡" : không cần hướng dẫn vì đã có quest text (kèm hiệu ứng hiển thị và sound để thu hút user đọc)
        - 'Một lá thư bí mật rơi xuống cạnh bánh sinh nhật! ✉️': không cần thiết
        - 'Đã lưu điều ước vào thư! Bấm "Gửi điều ước" khi bạn sẵn sàng nhé ✨': loại bỏ, chỉ giữ lại toast "Ước nguyện đã được gửi gắm vào các vì sao!" (trước migrate là cake prompt)
        - "Đã thổi tắt ${blownCount}/3 ngọn nến! 💨": không cần thiết, giảm trải nghiệm khám phá
- khi thổi tắt cả 3 nến, div ánh nến (flame) biến mất khiến bánh kem bị dịch lên trên một chút -> cần tránh thay đổi vị trí bánh kem
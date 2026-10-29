- Thu Thùy
- 29/10/2004 gmt+7
- màu yêu thích: cyan

### Triển khai backend:
> tôi đã init sẵn "hello world example" cloudflare worker trong thư mục source backend, sử dụng js
- sử dụng cloudflare worker:
    - thư mục source backend để trong root của repo
    - tôi sẽ liên kết cloudflare với github rồi deploy từ thư mục này
- mục tiêu của backend:
    - sử dụng 1 KV namespace để lưu trữ toàn bộ dữ liệu cần thiết
    - xác thực người dùng:
        - hiện tại đang hardcode username password -> không tối ưu -> chuyển qua cloudflare KV (sử dụng 1 cặp kv pair duy nhất: account_list, trong đó list_account lưu nhiều account dạng json, mỗi account có user name và password)
        - triển khai endpoint (đơn giản) để xác thực user name và password (check KV), trả về:
            - nếu sai: một mã secret quy định là sai (client biết)
            - nếu đúng: một mã secret quy định là đúng (client biết) và jwt đơn giản có hạn 30p -> client lưu jwt để kiểm tra thời gian phiên
    - triển khai endpoint để log dữ liệu người dùng:
        - khi gửi điều ước -> gọi tới endpoint (sync) log lại "thông tin thiết bị gửi" và "điều ước đã ghi" vào KV pair (key: log:timestamp, value: json {device_info, wish})
        - gửi request cần jwt còn hạn và hợp lệ (tránh spam)
        - lưu ý, chỉ lấy các thông tin thiết bị quan trọng để có thể nhận diện, nhưng cũng chỉ nên trong phạm vi hợp pháp
- sửa cả frontend để tương thích với backend mới
    - lưu BE_URL hardcode, tôi sẽ update sau
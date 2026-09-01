# Hướng dẫn đóng góp cho Velclaw

Cảm ơn bạn đã quan tâm đến Velclaw.

## Nguyên tắc

- Ưu tiên thay đổi nhỏ, rõ ràng và có thể kiểm tra.
- Không đưa khóa API, token, mật khẩu hoặc dữ liệu bí mật vào kho mã nguồn.
- Mọi thay đổi quan trọng phải đi qua yêu cầu thay đổi và kiểm tra tự động.
- Không tự ý thay đổi giao diện chuẩn đã được duyệt.
- Thay đổi giao diện phải mô tả rõ phạm vi ảnh hưởng và có kiểm tra trên thiết bị di động khi phù hợp.

## Quy trình

1. Tạo nhánh riêng cho thay đổi.
2. Thực hiện thay đổi và kiểm tra cục bộ.
3. Mở yêu cầu thay đổi vào `main`.
4. Chờ các kiểm tra tự động hoàn tất.
5. Người duy trì dự án xem xét và phê duyệt.
6. Chỉ hợp nhất khi các điều kiện bảo vệ của nhánh được đáp ứng.

## Bảo mật

Nếu phát hiện lỗ hổng, không công khai thông tin khai thác trong yêu cầu thay đổi hoặc thảo luận. Hãy làm theo `SECURITY.md`.

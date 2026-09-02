# Hệ thống thiết kế mặc định của Velclaw

## Quy tắc bắt buộc cho toàn hệ sinh thái

Mọi sản phẩm, trang web, ứng dụng, thư viện, công cụ, nhánh con hoặc dự án mới có liên quan đến Velclaw đều phải kế thừa và tuân thủ **phong cách mặc định của Velclaw**.

## Nguồn chuẩn

Giao diện Velclaw phải dùng chung design system của hệ sinh thái.

## Visual baseline

- nền đen/tối là mặc định;
- tím/violet là màu nhận diện chính;
- typography ưu tiên monospace/DejaVu Sans Mono-style;
- control, card và panel dùng góc vuông;
- header nhỏ gọn, có hamburger menu và Velclaw mark ở trung tâm;
- mobile ưu tiên reader/workspace, sidebar mở dạng drawer;
- desktop ưu tiên layout workspace nhiều cột nhưng không lãng phí diện tích đọc;
- focus/active dùng viền hoặc glow violet;
- logo Velclaw phải dùng asset nhận diện chuẩn.

## Các thành phần phải đồng bộ

- Logo và nhận diện chữ Velclaw.
- Phông chữ, cấp độ chữ và độ đậm.
- Bảng màu và trạng thái sáng/tối.
- Nút, ô nhập, thẻ, menu và điều khiển.
- Bo góc, đường viền, bóng và khoảng cách.
- Thanh đầu trang, điều hướng và các nút ngôn ngữ/chuyển chế độ.
- Trạng thái hover, focus, active và disabled.
- Bố cục đáp ứng trên máy tính và thiết bị di động.
- Agent Chat phải có nhận diện Velclaw rõ ràng và không trộn lẫn với branding của provider.

## Domain identity

**`velclaw.cfd` là domain duy nhất của Velclaw.**

Không sử dụng domain cũ, domain thử nghiệm hoặc virtual hostname khác trong source code, UI, test gateway, wiki hoặc ecosystem navigation.

Các route ecosystem dùng cùng canonical host:

- `https://velclaw.cfd/`
- `https://velclaw.cfd/docs`
- `https://velclaw.cfd/hub`
- `https://velclaw.cfd/mcp`
- `https://velclaw.cfd/api-keys`
- `https://velclaw.cfd/wiki`
- `https://velclaw.cfd/test`

Mapping DNS/proxy được quản lý ở hạ tầng deploy; source code chỉ duy trì canonical domain `velclaw.cfd`.

## Quy tắc cho dự án con

Một dự án mới không được tự ý tạo một bộ nhận diện giao diện hoặc domain identity khác nếu dự án đó thuộc hệ sinh thái Velclaw.

## Bảo vệ giao diện chuẩn

Thay đổi giao diện phải được xem xét về khả năng tương thích với hệ thống thiết kế trước khi hợp nhất. Các primitive UI dùng chung phải giữ radius về `0` và lấy màu từ design tokens.

## Mục tiêu

Người dùng phải nhận ra ngay một sản phẩm thuộc hệ sinh thái Velclaw thông qua ngôn ngữ thiết kế thống nhất và domain canonical `velclaw.cfd`.

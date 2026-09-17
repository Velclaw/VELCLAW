# VelclawHub Registry

`resources.json` là catalog các tài nguyên được phép hiển thị trên Hub.

`submissions.json` là registry cho các đề xuất đang đi qua lifecycle.

## Lifecycle

`draft → review → verified → published`

Không cho phép bỏ qua bước kiểm duyệt. `published` là trạng thái cuối trong catalog công khai.

## Backend boundary

Các file JSON hiện là registry tĩnh cho lớp trình bày và prototype. Việc ghi submission, xác thực quyền tác giả, review/gate và publish an toàn phải được thực hiện bởi backend có xác thực trước khi dùng production.

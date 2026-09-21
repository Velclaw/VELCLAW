# VelclawHub Resource Lifecycle

Every Hub resource has a stable ID, semantic version, metadata, and lifecycle status.

## Status flow

`draft → review → verified → published`

- **draft** — đang được tạo/chỉnh sửa; chưa công khai.
- **review** — đã gửi để kiểm tra.
- **verified** — đã vượt qua kiểm tra và được xác nhận.
- **published** — được phép xuất hiện trong kho tài nguyên công khai.

## Resource identity

Each resource should define:

- `id`: stable globally unique identifier.
- `type`: `agent`, `workflow`, `template`, `extension`, or `ui`.
- `name`: display name.
- `version`: semantic version.
- `status`: lifecycle status above.
- `author`: publisher/owner.
- `description`: concise purpose.
- `tags`: discovery metadata.

Published resources must have a stable ID and version. A new incompatible release must increment the major version.

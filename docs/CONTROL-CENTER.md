# VELCLAW · CONTROL CENTER

Một trang quản trị thống nhất cho dự án, tài nguyên và triển khai.

## Mục tiêu

VELCLAW Control Center là control plane tập trung để kết nối repository, dịch vụ chạy, deployment, domain/DNS, database, identity, AI providers và CI/CD trong một giao diện có thể kiểm chứng.

## Kiến trúc dự kiến

```text
GitHub repositories ─┐
Render services ─────┤
Vercel projects ─────┤──> VELCLAW Control Center ──> Inventory / Health / Audit
Cloudflare DNS ─────┤
PostgreSQL/Supabase ┤
OAuth / AI / MCP ────┘
```

## Trạng thái hiện tại

- Giao diện ban đầu: [`app/control-center/page.tsx`](../app/control-center/page.tsx).
- Danh mục kiến trúc và tài nguyên đã quan sát: [`ECOSYSTEM.md`](./ECOSYSTEM.md).
- GitHub, Render, Vercel và Cloudflare có các kết nối công cụ; quyền truy cập và độ bao phủ khác nhau theo nhà cung cấp.
- Danh sách repo trong UI hiện là seed inventory, chưa được đồng bộ đầy đủ từ mọi trang API. Không được trình bày nó như danh mục hoàn chỉnh.
- Chưa xác nhận route Control Center đã deploy, chưa xác nhận production health của route này.

## Các module

1. **Overview** — số liệu tổng quan, health và cảnh báo.
2. **Repositories** — owner, visibility, branch, archived state, ngôn ngữ, CI và vai trò.
3. **Deployments** — ánh xạ repo → branch → commit → provider service → URL.
4. **Domains & DNS** — DNS, TLS, Cloudflare Access/WAF, Worker/Pages và origin.
5. **Databases** — PostgreSQL/Supabase, schema/migration, backup/restore và health.
6. **Integrations** — GitHub, Render, Vercel, Cloudflare, OAuth, AI providers và MCP.
7. **Security** — least privilege, secrets inventory (chỉ tên biến/trạng thái; không đọc hoặc hiển thị giá trị), callback URLs và audit.
8. **Audit log** — nguồn dữ liệu, thời gian quét, kết quả, commit/deploy ID và lỗi.

## Nguyên tắc liên kết hệ sinh thái

- Giữ source repo riêng khi có lịch sử, quyền truy cập, CI hoặc vòng đời release riêng; thống nhất bằng registry và contract thay vì gộp mù quáng.
- Mọi resource có định danh ổn định từ provider và liên kết bằng foreign key hoặc external ID.
- Dữ liệu cần lưu `source`, `observed_at`, `last_checked_at`, `status`, `error` và `owner`.
- Không tự xóa, transfer, merge repo, sửa DNS, đổi route production hoặc chạy migration phá hủy chỉ vì phát hiện trùng lặp.
- Không hiển thị API token, OAuth secret, database URL hoặc giá trị secrets ở client.
- Chỉ đánh dấu `healthy` khi có health check thật, có timestamp và kết quả cụ thể.
- Ghi rõ “sponsor” chỉ khi có bằng chứng xác nhận tài trợ; các SDK/framework/hosting providers là công cụ/tích hợp, không mặc nhiên là sponsor.

## Lộ trình triển khai

### P0 — Inventory có thể kiểm chứng
- [ ] Quét tất cả trang repository cho từng GitHub account/org được kết nối.
- [ ] Ghi owner, repo ID, visibility, default branch, archived, URL và quyền đọc.
- [ ] Lấy toàn bộ Render services/workspaces và Vercel projects/deployments.
- [ ] Khám phá Cloudflare accounts, zones, DNS, Workers/Pages, Access rules và routes với quyền chỉ đọc.
- [ ] Lập bản đồ database/provider integrations; chỉ ghi tên resource và trạng thái, không sao chép secrets.

### P1 — Server-side provider adapters
- [ ] Tạo adapters có timeout, retry, pagination, schema validation và rate-limit handling.
- [ ] Chỉ chạy server-side; kiểm tra session/role trước mọi request.
- [ ] Thêm cache có thời hạn, partial-failure reporting và nút refresh.
- [ ] Bổ sung health checks không gây tác dụng phụ.

### P2 — Persistent registry và audit
- [ ] Thiết kế schema PostgreSQL cho providers, repositories, deployments, domains, databases, links và scan runs.
- [ ] Thêm migrations, retention policy, audit events và kiểm thử backup/restore.
- [ ] Chỉ lưu external IDs và metadata tối thiểu; secrets ở secret manager của provider.

### P3 — Safe operations
- [ ] Preview/dry-run cho mọi thay đổi.
- [ ] RBAC, confirmation, idempotency keys và audit trail.
- [ ] Không cho phép thao tác phá hủy cho đến khi owner mapping và recovery plan được xác nhận.

### P4 — Production verification
- [ ] Type-check, tests, production build.
- [ ] Deploy qua pipeline đã cấu hình.
- [ ] Kiểm tra `/api/health` và `/control-center` trên production.
- [ ] Xác minh HTTP status, commit SHA, database connectivity và provider error states.

## Kiểm tra và lệnh phát triển

```bash
npm install
npm run dev
npm run type-check
npm test
npm run build
```

Mở `http://localhost:3000/control-center` khi chạy local. Dùng package manager và lockfile đã được commit; không tạo lockfile cạnh tranh.

## Tài liệu liên quan

- [README tổng quan](../README.md)
- [Ecosystem master registry](./ECOSYSTEM.md)
- [GitHub repository](https://github.com/Velclaw/VELCLAW)

## Giấy phép và attribution

Không suy đoán giấy phép dự án. Kiểm tra file `LICENSE` trước khi công bố quyền sử dụng/phân phối. Không tuyên bố nhà tài trợ chính thức khi chưa có xác nhận.

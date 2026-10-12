# Hướng dẫn chi tiết: Gắn kết Velclaw MCP vào Cursor

## Link tài liệu chính thức

| Mục đích | Link |
|----------|------|
| Tài liệu MCP chính thức của Cursor | https://cursor.com/docs/mcp |
| Help / Customization MCP | https://cursor.com/help/customization/mcp |
| MCP Directory (marketplace) | https://cursor.com/docs/context/mcp/directory |
| CLI MCP commands | https://cursor.com/docs/cli/mcp |

> **Lưu ý:** Settings → Tools & MCP là panel **bên trong ứng dụng Cursor**, không có URL web công khai trỏ trực tiếp vào đó. Bạn phải mở Cursor rồi điều hướng thủ công.

---

## Cách mở Settings → Tools & MCP trong Cursor

### Cách 1: Phím tắt (nhanh nhất)
1. Mở Cursor.
2. Nhấn:
   - **macOS:** `Cmd + ,`
   - **Windows/Linux:** `Ctrl + ,`
3. Trong cửa sổ Settings, tìm mục **Tools & MCP** (hoặc **MCP** / **Tools & Integrations** tùy phiên bản).

### Cách 2: Command Palette
1. Nhấn `Cmd/Ctrl + Shift + P`.
2. Gõ `MCP` hoặc `View: Open MCP Settings`.
3. Chọn lệnh liên quan đến MCP Settings.

### Cách 3: Sidebar
1. Mở sidebar **Customize**.
2. Chọn **MCPs**.

---

## Cấu hình hiện có trong repo

File `.cursor/mcp.json` đã được tạo sẵn:

```json
{
  "mcpServers": {
    "velclaw": {
      "url": "https://mcp.velclaw.site/mcp",
      "description": "Velclaw MCP — status, capabilities, and ecosystem tools (read-only by default). Authenticate via Cloudflare Access on first connect."
    }
  }
}
```

Endpoint: `https://mcp.velclaw.site/mcp`  
Transport: Streamable HTTP  
Auth: Cloudflare Access (đăng nhập browser lần đầu)

---

## Các bước gắn kết đầy đủ

1. **Clone / pull** repo `Velclaw/VELCLAW` mới nhất.
2. Mở thư mục project trong Cursor.
3. Mở **Settings → Tools & MCP**.
4. Server `velclaw` sẽ xuất hiện (do file `.cursor/mcp.json` đã có).
5. Nhấn **Connect** / **Enable**.
6. Hoàn thành Cloudflare Access sign-in khi browser mở.
7. Kiểm tra tools:
   - `velclaw_mcp_status`
   - `velclaw_mcp_capabilities`
8. Trong chat/Composer, hỏi thử: “Check Velclaw MCP status”.

---

## Kiểm tra bằng CLI (tùy chọn)

```bash
# Cài Cursor CLI nếu chưa có
curl https://cursor.com/install -fsS | bash

# List MCP servers
agent mcp list

# List tools của server velclaw
agent mcp list-tools velclaw
```

---

## Troubleshooting

| Vấn đề | Cách xử lý |
|--------|------------|
| Không thấy server `velclaw` | Kiểm tra file `.cursor/mcp.json` ở root project, restart Cursor |
| Yêu cầu đăng nhập Cloudflare Access | Đăng nhập bằng tài khoản có quyền trên Cloudflare account |
| Tools không load | Xem MCP Logs: `Cmd/Ctrl + Shift + U` → chọn **MCP Logs** |
| Muốn thêm tool mới | Tools được định nghĩa trên Cloudflare MCP Portal, không phải trong file này. Cập nhật portal rồi reconnect |

---

## Tài liệu liên quan trong repo

- `docs/integrations/velclaw-mcp.md` — mô tả server và chính sách bảo mật
- `.agents/skills/velclaw-agent-platform/SKILL.md` — skill tổng hợp
- `.cursor/mcp.json` — cấu hình Cursor cho project này

---

## Bảo mật

- Không commit token / secret vào `mcp.json`.
- Server hiện tại **read-only**.
- Không bật write tools cho đến khi có approval workflow rõ ràng.

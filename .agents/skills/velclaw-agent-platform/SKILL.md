---
name: velclaw-agent-platform
description: "Điều phối multi-agent, tích hợp channel (Telegram/WhatsApp/WeChat), coding agent, monitoring/dashboard, và plugin auth Cursor cho hệ sinh thái Velclaw. Dùng khi cần orchestration, channel setup, AI coding workflow, health check, hoặc cấu hình CURSOR_API_KEY / OIDC / MCP auth."
type: workflow
lifecycle: active
---

# Velclaw Agent Platform — Full Stack Skill

Skill điều phối toàn bộ agent platform của Velclaw: multi-agent orchestration, channel integrations, coding workflows, monitoring, và đặc biệt là tích hợp xác thực Cursor.

## Khi nào dùng
- Thiết lập / điều phối multi-agent (roles, routing, workspace, memory)
- Tích hợp kênh nhắn tin (Telegram, WhatsApp, WeChat KF, Discord, Matrix...)
- Coding agent: review, refactor, build, PR, Vercel deploy
- Monitoring, health check, usage, logs, dashboard
- Cấu hình auth Cursor (API key, browser login, OIDC, MCP)

## 1. Multi-Agent / Orchestration
- Workspace model: `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md`
- Role routing qua AgentOS / control plane
- Memory layers: short-term (session), long-term, project/entity
- Luôn approval-first cho thay đổi high-impact (auth, secrets, deploy, schema)
- Dùng branch riêng + PR, không push trực tiếp main trừ khi policy cho phép

## 2. Channel Integrations
Cấu hình channel qua plugin/extension, secrets luôn qua env var `${VAR}`:

| Channel | Plugin / Cách | Secrets chính |
|---------|---------------|---------------|
| Telegram | Bot token | `TELEGRAM_BOT_TOKEN` |
| WhatsApp | Official / Web | `WHATSAPP_TOKEN` |
| WeChat KF | wechat-kf | `WECOM_KF_SECRET`, `WECOM_KF_CALLBACK_TOKEN`, `WECOM_KF_AES_KEY` |
| Discord / Matrix / Lark | channel-* | Tương ứng |

Sau khi config: restart gateway/channel và `probe` / status để verify.

## 3. Coding Agent / AI Programming
- Đọc `AGENTS.md` trước mọi thay đổi
- Chạy: `pnpm format && pnpm type-check && pnpm lint && pnpm build`
- Không chạy `dev` server (tránh conflict)
- Không log dynamic values / secrets
- Prefer smallest reversible fix, tạo branch + PR
- Tích hợp Vercel skill khi deploy

## 4. Monitoring / Dashboard / Health
- Kiểm tra gateway status, channel probe, deployment READY
- Health endpoints, logs (static strings only)
- Usage telemetry (nếu bật), session list, memory inspection
- Dashboard / control center modules: Repositories, Deployments, Domains, Integrations, Audit

## 5. Cursor Auth Plugin Integration

### Script hỗ trợ setup
Có sẵn script tự động hướng dẫn:
```bash
# Từ thư mục skill
bash scripts/setup-cursor-auth.sh
# hoặc
chmod +x scripts/setup-cursor-auth.sh && ./scripts/setup-cursor-auth.sh
```
Script sẽ:
- Kiểm tra CLI đã cài chưa
- Hiển thị status hiện tại
- Cho chọn Browser login hoặc nhập API Key (ẩn input)
- Tùy chọn ghi vào `~/.bashrc` / `~/.zshrc`
- Verify lại bằng `agent status`

### API Key (khuyến nghị cho automation)
```bash
export CURSOR_API_KEY=your_api_key_here
# Lấy từ Cursor Dashboard → API Keys
agent status   # kiểm tra
agent "implement feature"   # chạy
```

### Browser Login
```bash
agent login          # mở browser
# hoặc NO_OPEN_BROWSER=1 agent login
agent logout
```

### OIDC Tokens (Cloud Agents)
Agent có thể mint short-lived OIDC JWT qua local socket:
```bash
curl --unix-socket "${CURSOR_AGENT_SOCKET}" \
  -H 'Content-Type: application/json' \
  -d '{"aud":"sts.amazonaws.com"}' \
  http://cursor-agent/v1/tokens/oidc
```
Verifier dùng JWKS từ `https://api.cursor.com/keys`.

### MCP Auth trong Cursor
Trong `.cursor/mcp.json` hoặc `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "velclaw": {
      "url": "https://your-velclaw-mcp.example/mcp",
      "headers": {
        "Authorization": "Bearer ${env:VELCLAW_MCP_TOKEN}"
      }
    }
  }
}
```
Hoặc OAuth flow nếu gateway hỗ trợ.

### BYOK Models trong Cursor
Cursor Settings → Models → thêm OpenAI / Anthropic / Google / Azure / Bedrock key.

## Best Practices Bảo mật
- Không commit bất kỳ API key / token / secret nào
- Dùng env var + redact trong logs
- Approval bắt buộc cho auth, OAuth, secrets, billing, DNS, schema
- Rotate token định kỳ
- Least privilege, audit log mọi hành động

## Lỗi thường gặp
| Vấn đề | Cách xử lý |
|--------|------------|
| Cursor agent status unauthenticated | `export CURSOR_API_KEY=...` hoặc `agent login` |
| Channel không nhận webhook | Kiểm tra token, encoding AES, probe status |
| Build fail sau thay đổi | Chạy đủ format/type-check/lint/build |
| MCP không kết nối | Kiểm tra header / env var / OAuth callback |
| Gateway auth fail | Xác nhận token trong config, restart |

## Tài liệu liên quan trong repo
- `AGENTS.md` — security & quality rules bắt buộc
- `.agents/skills/vercel-platform/` — deploy
- `.agents/skills/velclaw-github-guardian/` — review/PR policy
- `docs/` — Control Center, Ecosystem, integrations

Luôn ưu tiên đọc tài liệu hiện có của Velclaw trước khi thực hiện thay đổi.

---
name: velaclaw-api-agent
description: "Hướng dẫn tích hợp API token, cấu hình agent, và tạo plugins/skills cho dự án AI sử dụng repo VelaClaw/VELCLAW (ailib-official/velaclaw hoặc zylzyqzz/Vclaw). Dùng khi cần setup BYOK, cấu hình gateway auth, quản lý API keys, hoặc mở rộng agent runtime."
type: workflow
lifecycle: active
---

# Velaclaw API Agent — Tích hợp API Token & Agent trong dự án AI

Skill này giúp cấu hình, tích hợp và mở rộng agent runtime từ repo VelaClaw/VELCLAW. Tập trung vào quản lý API token an toàn (BYOK), cấu hình gateway, và hệ thống skills/plugins.

## Khi nào dùng
- Setup agent với API key (OpenAI, Anthropic, DeepSeek, ...)
- Cấu hình gateway auth token hoặc channel secrets
- Tạo custom skill/plugin cho agent
- Tích hợp vào dự án lập trình AI (coding agent, multi-agent, local-first)

## Các repo chính

| Repo | Loại | Điểm mạnh | Config chính |
|------|------|-----------|--------------|
| **ailib-official/velaclaw** | Rust agent runtime (reference) | BYOK trực tiếp, protocol-driven (ai-protocol YAML), không hardcode provider | `~/.velaclaw/config.toml`, env vars |
| **zylzyqzz/Vclaw** | Local-first multi-agent | Gateway + AgentOS, workspace files, plugins/extensions | `vclaw.json`, workspace `AGENTS.md`... |

## Workflow: Setup API Token (BYOK)

### 1. VelaClaw (Rust - ailib-official/velaclaw)
```bash
# Clone protocol manifests
git clone https://github.com/ailib-official/ai-protocol ~/.velaclaw/ai-protocol

# Install
cargo install velaclaw
# hoặc từ source: git clone https://github.com/ailib-official/velaclaw && cargo build --release

# Onboard
velaclaw onboard
```

**Environment variables (ưu tiên):**
```bash
export AI_PROTOCOL_DIR=~/.velaclaw/ai-protocol
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export DEEPSEEK_API_KEY=sk-...
```

**config.toml** (`~/.velaclaw/config.toml`):
```toml
[routing]
provider_mode = "byok"   # hoặc "prism" cho fallback

[telemetry]
enabled = false
```

**Chạy agent:**
```bash
velaclaw agent -m "Explain this code" --model openai/gpt-4o-mini
velaclaw skills   # quản lý skills/tools
```

### 2. Vclaw (zylzyqzz/Vclaw)
```bash
# Install từ GitHub installer (xem README repo)
# Tạo config
```

**vclaw.json** (gateway auth):
```json
{
  "gateway": {
    "port": 18789,
    "bind": "loopback",
    "auth": {
      "token": "thay-bang-token-ngau-nhien-dai"
    }
  },
  "agent": {
    "workspace": "~/.vclaw/workspace"
  }
}
```

**Channel secrets** (dùng env var, không hardcode):
```json
{
  "channels": {
    "wechat-kf": {
      "corpSecret": "${WECOM_KF_SECRET}",
      "token": "${WECOM_KF_CALLBACK_TOKEN}",
      "encodingAesKey": "${WECOM_KF_AES_KEY}"
    }
  }
}
```

```bash
export WECOM_KF_SECRET=...
vclaw gateway restart
vclaw channels status --probe
```

## Tạo / Mở rộng Skills & Plugins

### Trong VelaClaw
- Skills nằm trong hệ thống extensible (`velaclaw skills`)
- Hỗ trợ: shell, file ops, browser (fantoccini), MCP tools, custom WIT (optional WASM)
- Thêm skill: tạo tool mới và đăng ký vào tool loop của agent

### Trong Vclaw
- Skills: thư mục `skills/` → merge vào `workspace/skills/`
- Plugins: `extensions/` (ví dụ wechat-kf)
- Workspace control files:
  - `AGENTS.md` — định nghĩa roles
  - `SOUL.md` — persona/tone
  - `TOOLS.md` — tool usage
  - `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md`

**Cài plugin:**
```bash
vclaw plugins install ./extensions/wechat-kf
```

## Best Practices API Token
1. **Luôn dùng env vars** — không commit token vào repo/git.
2. **BYOK mode** — key không rời máy (VelaClaw).
3. **Gateway token** — random dài, chỉ local bind nếu có thể.
4. **Rotate token** định kỳ.
5. **Probe/verify** sau khi config: `vclaw channels status --probe` hoặc test `velaclaw agent`.

## Lỗi thường gặp
| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| Missing API key | Env var chưa set | `export OPENAI_API_KEY=...` rồi restart |
| Gateway auth fail | Token sai trong vclaw.json | Kiểm tra và restart gateway |
| Protocol not found | Chưa clone ai-protocol | `git clone ... ~/.velaclaw/ai-protocol` |
| Plugin không load | Sai path hoặc chưa enable | `vclaw plugins install ...` + restart |

## Tài liệu tham khảo
- VelaClaw: https://github.com/ailib-official/velaclaw
- Vclaw: https://github.com/zylzyqzz/Vclaw
- ai-protocol: https://github.com/ailib-official/ai-protocol

Khi làm việc với dự án cụ thể, luôn ưu tiên đọc README và config example của repo trước khi thay đổi.

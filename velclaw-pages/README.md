<div align="center">

<img src="assets/velclaw-logo.svg" alt="Velclaw Workspace" width="120" />

# Velclaw Workspace

**Standalone mobile-first Codebase/Agent IDE cho hệ sinh thái Velclaw.**

</div>

## Kiến trúc

`zskbot/eve-pages` là companion/child project độc lập của `Velclaw/Velclaw`, nhưng có thể chạy và deploy riêng. Frontend dùng Vercel Functions cho API; local mode dùng `server.js`.

```text
VELCLAW ECOSYSTEM
├── Velclaw/Velclaw        # CORE / MAIN
└── zskbot/eve-pages       # CODEBASE / AGENT IDE
       │
       ├── Codebase editor + file tree
       ├── Agent bridge
       ├── GitHub Source Control
       └── CI status
```

## Chạy local

Node.js 20+:

```bash
npm start
```

Mở `http://localhost:8080/`.

## Deployed API

Vercel Functions:

| Endpoint | Method | Chức năng |
|---|---:|---|
| `/api/health` | GET | Health check |
| `/api/workspace/status` | GET | Runtime + Agent + GitHub status |
| `/api/workspace/tree` | GET | Codebase tree |
| `/api/workspace/file?path=...` | GET | Đọc file từ GitHub |
| `/api/workspace/file` | POST | Lưu file vào GitHub |
| `/api/agent/chat` | POST | Proxy tới Velclaw Agent |
| `/api/git/status` | GET | HEAD + commit history |
| `/api/git/branch` | POST | Tạo branch |
| `/api/git/commit` | POST | Tạo commit từ file contents |
| `/api/git/pr` | POST | Tạo pull request |
| `/api/ci/status` | GET | GitHub Actions status |

## Environment

Cấu hình server-side, không đưa token vào browser:

```text
VELCLAW_AGENT_URL=
VELCLAW_AGENT_TOKEN=
GITHUB_TOKEN=
GITHUB_REPO=zskbot/eve-pages
GITHUB_BRANCH=main
```

`GITHUB_TOKEN` cần quyền phù hợp để đọc/ghi repository và tạo PR. `VELCLAW_AGENT_URL` phải trỏ tới endpoint Agent thật tương thích với request `{ message, path, model }`.

## IDE workflow

```text
Prompt
  ↓
Agent
  ↓
Plan
  ↓
Edit Codebase
  ↓
Git Diff / Branch
  ↓
Build / Test / CI
  ↓
Review
  ↓
Fix
  ↓
Rerun
  ↓
PASS
  ↓
Commit
  ↓
Pull Request
```

## UI

- Menu 3 gạch là navigation chính, giải phóng chiều cao màn hình.
- Toàn bộ ecosystem links nằm trong menu thay vì chiếm workspace canvas.
- Codebase drawer + file filter.
- Multi-tab editor, line gutter, cursor position, language detection, word wrap, search.
- Command palette `Ctrl/Cmd + K`.
- Agent chat và Source Control là workspace panels.
- Source Control có branch, commit và PR actions.

## Security

Deployed write operations yêu cầu `GITHUB_TOKEN`. Không expose token client-side. Local filesystem API có path traversal protection. Khi public deployment, nên thêm authentication/session và authorization trước khi cho phép người dùng sửa code hoặc tạo PR.

## License

Xem `LICENSE`.

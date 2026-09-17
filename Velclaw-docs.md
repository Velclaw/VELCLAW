# Velclaw — Tài liệu dự án

# 1. Tổng quan

**Velclaw** là một AI-native software workspace, tập trung vào toàn bộ vòng đời phát triển phần mềm: **agents, code, projects, builds, runtime, storage, services, review, và deployment**.

Mục tiêu: cung cấp cho coding agents và developers **một môi trường thống nhất**, thay vì phải làm việc qua nhiều công cụ rời rạc.

> Build software. Give agents context. Keep the workflow together.
> 

**Trạng thái license:** Repo hiện là **private/proprietary**. Chưa có file `LICENSE` công khai — không claim là open-source cho tới khi có quyết định chính thức.

---

# 2. Kiến trúc hệ thống

```
                         ┌─────────────────────────┐
                         │       AI AGENTS         │
                         │ models · tools · tasks  │
                         └────────────┬────────────┘
                                      │
                                      ▼
┌──────────────────┐       ┌─────────────────────────┐       ┌──────────────────┐
│ Projects & Files │ ◄──── │    VELCLAW WORKSPACE    │ ────► │ Build & Runtime  │
│ code · context   │       │ projects · code · state │       │ build · execute  │
└──────────────────┘       └────────────┬────────────┘       └──────────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                    ┌─────────┐   ┌──────────┐   ┌─────────────┐
                    │ Storage │   │ GitHub   │   │ Deployment  │
                    │ data    │   │ review   │   │ delivery    │
                    └─────────┘   └──────────┘   └─────────────┘
```

## Các thành phần chính (Capabilities)

| Thành phần | Vai trò |
| --- | --- |
| **AI Agents** | Điều phối workflow phát triển do agent chủ trì, thực thi tool |
| **Workspace** | Quản lý projects, files, code, context và state bền vững |
| **Build** | Build, validate và đóng gói phần mềm |
| **Runtime** | Thực thi workload và các tiến trình dev |
| **Storage** | Lưu trữ dữ liệu ứng dụng và file |
| **GitHub** | Tích hợp repository, code review, delivery workflow |
| **Deployment** | Đưa phần mềm đã kiểm định lên production |
| **Developer UI** | Một workspace duy nhất cho toàn bộ vòng đời phần mềm |

## Tech stack

- **Framework:** Next.js, React
- **Ngôn ngữ:** TypeScript
- **Runtime:** Node.js
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (qua Drizzle ORM)

---

# 3. Hướng dẫn cài đặt / Quick Start

## Yêu cầu

- Node.js
- npm
- Git

## Các bước

```bash
git clone https://github.com/Velclaw/Velclaw.git
cd Velclaw
npm install
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

## Kiểm tra (validation)

```bash
npm run type-check
npm run build
```

---

# 4. Cấu trúc dự án (Project Structure)

```
Velclaw/
├── app/                 # Next.js application routes
├── components/          # UI và các thành phần workspace
├── lib/                 # application services và integrations
├── public/              # public assets
├── server/              # server-side runtime pieces
├── drizzle/             # database schema/migrations
├── .github/             # CI và automation
└── README.md
```

| Thư mục | Mô tả |
| --- | --- |
| `app/` | Định tuyến (routes) của ứng dụng Next.js |
| `components/` | Component UI dùng chung và các thành phần workspace |
| `lib/` | Service layer, tích hợp với các hệ thống ngoài |
| `server/` | Logic runtime phía server |
| `drizzle/` | Schema và migration cho PostgreSQL |
| `.github/` | Pipeline CI/CD, automation |

## Luồng làm việc GitHub

```
Issue / Task
     │
     ▼
Agent + Developer
     │
     ▼
Workspace → Code → Build → Typecheck
     │
     ▼
GitHub branch
     │
     ▼
Pull Request → Review → Merge
     │
     ▼
Deployment
```

---

# 5. Quy trình đóng góp (Contributing)

1. Tạo branch mới.
2. Thực hiện thay đổi nhỏ nhất, gọn gàng nhất có thể (smallest coherent change).
3. Chạy `npm run type-check` và `npm run build` để kiểm tra.
4. Mở Pull Request.
5. Xử lý phản hồi từ review.
6. Merge sau khi các check bắt buộc pass.

## Quy ước bảo mật (Security)

⚠️ **Không được commit**:

- Credentials
- API keys
- OAuth secrets
- Database URLs
- Private deployment tokens

---

# 6. Roadmap

- [x]  Core workspace
- [x]  GitHub integration foundation
- [x]  Build/runtime workflow foundation
- [x]  Mở rộng agent workflows
- [x]  Mở rộng deployment automation
- [x]  Trang documentation chính thức riêng
- [x]  Observability cấp production
- [x]  Tích hợp hệ sinh thái rộng hơn

---

# 7. Hệ sinh thái công nghệ tham chiếu

Đây là các tham chiếu open-source, công cụ, hoặc nguồn cảm hứng — **không phải nhà tài trợ** trừ khi có quan hệ sponsorship chính thức.

**Core:** Vercel, Next.js, tsx, Tenderdash, Dash Platform

**Icon/Asset/Tooling:** Simple Icons, VectorLogoZone, thesvg, developer-icons, vscode-icons-svg, profile-readme-generator, GitAscii, GitHub Profile README Generator

---

# 8. Liên kết

- Repository: [https://github.com/Velclaw/Velclaw](https://github.com/Velclaw/Velclaw)
- Issues: [https://github.com/Velclaw/Velclaw/issues](https://github.com/Velclaw/Velclaw/issues)
- Pull requests: [https://github.com/Velclaw/Velclaw/pulls](https://github.com/Velclaw/Velclaw/pulls)
- Documentation site: *(sẽ cập nhật khi ra mắt chính thức)*
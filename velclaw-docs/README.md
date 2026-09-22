# velclaw

Trang tài liệu (docs) cho dự án velclaw. Xây dựng bằng **Vite + React**, giao diện
nền tối theo phong cách trang docs tối giản: header dính (sticky), breadcrumb, menu
di động toàn màn hình, card "Agent Prompt" có thể mở rộng, khối lệnh có nút sao chép.

## Cấu trúc thư mục

```
velclaw-docs/
├── index.html
├── vite.config.js
├── vercel.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css          # design tokens (màu, font, spacing)
│   ├── data/nav.js         # cấu trúc menu điều hướng
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── CodeBlock.jsx
│   │   ├── AgentPromptCard.jsx
│   │   └── DocsLayout.jsx
│   └── pages/
│       ├── Introduction.jsx
│       ├── GettingStarted.jsx
│       ├── Installation.jsx
│       ├── Configuration.jsx
│       └── Deployment.jsx
```

## Chạy cục bộ

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview   # xem thử bản build
```

## Triển khai lên Vercel + đẩy lên repo `velclaw/velclaw`

1. **Khởi tạo Git và đẩy code lên GitHub** (nếu repo `velclaw/velclaw` chưa có code này):

   ```bash
   git init
   git add .
   git commit -m "Khởi tạo trang docs velclaw"
   git branch -M main
   git remote add origin https://github.com/velclaw/velclaw.git
   git push -u origin main
   ```

2. **Cài Vercel CLI** (nếu chưa có):

   ```bash
   npm install -g vercel
   ```

3. **Đăng nhập**:

   ```bash
   vercel login
   ```

4. **Liên kết & triển khai** — chạy trong thư mục dự án:

   ```bash
   vercel        # triển khai bản preview, làm theo hướng dẫn để link với repo velclaw/velclaw
   vercel --prod # triển khai bản chính thức (production)
   ```

   Bạn cũng có thể dùng `npx vercel` nếu không muốn cài CLI toàn cục.

5. **Tự động triển khai qua GitHub** (khuyến nghị): trong Vercel Dashboard →
   *Add New Project* → import repo `velclaw/velclaw`. Vercel tự nhận diện Vite
   (build command: `npm run build`, output: `dist`). Từ đó, mỗi lần push lên
   nhánh `main` sẽ tự động deploy.

## Tùy chỉnh nội dung

- Sửa nội dung từng trang trong `src/pages/`.
- Thêm/bớt mục menu trong `src/data/nav.js`.
- Đổi màu sắc/font trong `src/index.css` (phần `:root`).

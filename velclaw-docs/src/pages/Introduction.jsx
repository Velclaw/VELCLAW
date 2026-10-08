import { Link } from 'react-router-dom'
import DocsLayout from '../components/DocsLayout'

export default function Introduction() {
  return (
    <DocsLayout
      title="Giới thiệu velclaw"
      description="Tài liệu chính thức cho dự án velclaw — mọi thứ bạn cần để cài đặt, cấu hình và triển khai."
    >
      <p>
        velclaw là dự án của bạn. Trang tài liệu này được dựng theo phong cách tối giản,
        nền tối, lấy cảm hứng từ các trang docs hiện đại — dễ đọc trên di động, tải nhanh
        và không có gì thừa.
      </p>

      <h2>Bắt đầu từ đâu</h2>
      <ul>
        <li>
          <Link to="/bat-dau">Bắt đầu sử dụng</Link> — cài đặt CLI và chạy dự án lần đầu.
        </li>
        <li>
          <Link to="/cai-dat">Cài đặt</Link> — yêu cầu hệ thống và các bước chuẩn bị.
        </li>
        <li>
          <Link to="/trien-khai">Triển khai</Link> — đưa dự án lên Vercel bằng CLI.
        </li>
      </ul>

      <h2>Điều kiện tiên quyết</h2>
      <ul>
        <li>Tài khoản Vercel</li>
        <li>Node.js 18+</li>
        <li>Git đã được cài đặt</li>
      </ul>
    </DocsLayout>
  )
}

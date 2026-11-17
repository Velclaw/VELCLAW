import DocsLayout from '../components/DocsLayout'
import CodeBlock from '../components/CodeBlock'

export default function Configuration() {
  return (
    <DocsLayout
      title="Cấu hình dự án"
      description="Tùy chỉnh vite.config.js và các biến môi trường cho velclaw."
    >
      <h2>Biến môi trường</h2>
      <p>Tạo tệp <code>.env.local</code> ở thư mục gốc:</p>
      <CodeBlock>{'VITE_API_URL=https://api.velclaw.com'}</CodeBlock>

      <h2>Cấu hình Vite</h2>
      <p>
        Tệp <code>vite.config.js</code> đã được thiết lập sẵn với plugin React. Bạn có
        thể thêm alias, proxy hoặc plugin khác tại đây khi dự án phát triển.
      </p>
    </DocsLayout>
  )
}

import DocsLayout from '../components/DocsLayout'
import CodeBlock from '../components/CodeBlock'

export default function Installation() {
  return (
    <DocsLayout
      title="Cài đặt"
      description="Thiết lập môi trường phát triển cục bộ cho velclaw."
    >
      <h2>Sao chép kho lưu trữ</h2>
      <CodeBlock>git clone https://github.com/velclaw/velclaw.git</CodeBlock>

      <h2>Cài đặt các gói phụ thuộc</h2>
      <CodeBlock>npm install</CodeBlock>

      <h2>Chạy máy chủ phát triển</h2>
      <CodeBlock>npm run dev</CodeBlock>
      <p>Mặc định dự án sẽ chạy tại <code>http://localhost:5173</code>.</p>
    </DocsLayout>
  )
}

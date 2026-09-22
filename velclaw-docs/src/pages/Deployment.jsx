import DocsLayout from '../components/DocsLayout'
import CodeBlock from '../components/CodeBlock'

export default function Deployment() {
  return (
    <DocsLayout
      title="Triển khai"
      description="Đưa velclaw lên Vercel, kết nối với kho GitHub velclaw/velclaw để tự động triển khai mỗi khi push."
    >
      <h2>Triển khai thủ công qua CLI</h2>
      <CodeBlock>npx vercel --prod</CodeBlock>

      <h2>Kết nối GitHub để triển khai tự động</h2>
      <ul>
        <li>Đẩy mã nguồn lên kho <code>velclaw/velclaw</code> trên GitHub.</li>
        <li>Trong Vercel Dashboard, chọn "Add New Project" và import kho này.</li>
        <li>Vercel tự phát hiện Vite và điền sẵn lệnh build/output.</li>
        <li>Mỗi lần push lên nhánh chính, Vercel sẽ tự động triển khai bản mới.</li>
      </ul>

      <h2>Lệnh build</h2>
      <CodeBlock>npm run build</CodeBlock>
      <p>Thư mục output là <code>dist/</code>, đã được cấu hình sẵn trong <code>vercel.json</code>.</p>
    </DocsLayout>
  )
}

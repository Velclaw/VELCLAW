import DocsLayout from '../components/DocsLayout'
import CodeBlock from '../components/CodeBlock'
import AgentPromptCard from '../components/AgentPromptCard'

export default function GettingStarted() {
  return (
    <DocsLayout
      title="Bắt đầu sử dụng"
      description="Triển khai dự án velclaw của bạn theo ba bước: cài đặt CLI, thêm hỗ trợ tác nhân AI nếu cần, và triển khai."
    >
      <AgentPromptCard>
        Hãy giúp tôi thiết lập velclaw. Dựa trên dự án của tôi, hãy thực hiện các bước
        sau: 1. Cài đặt Vercel CLI. 2. Đăng nhập tài khoản Vercel. 3. Chạy lệnh triển
        khai và xác nhận kết quả trước khi đưa lên môi trường sản xuất.
      </AgentPromptCard>

      <h2>Điều kiện tiên quyết</h2>
      <ul>
        <li>Một tài khoản Vercel</li>
        <li>Node.js 18+</li>
      </ul>

      <hr />

      <h2>1. Cài đặt CLI</h2>
      <p>Cài đặt Vercel CLI trên toàn hệ thống bằng npm:</p>
      <CodeBlock>npm install -g vercel</CodeBlock>

      <h2>2. Đăng nhập</h2>
      <p>Xác thực CLI với tài khoản Vercel của bạn:</p>
      <CodeBlock>vercel login</CodeBlock>

      <h2>3. Triển khai dự án của bạn</h2>
      <p>Điều hướng đến thư mục dự án và chạy lệnh sau:</p>
      <CodeBlock>vercel</CodeBlock>
      <p>
        Công cụ dòng lệnh (CLI) sẽ phát hiện framework của bạn, xây dựng dự án và
        triển khai nó. Để triển khai lên môi trường sản xuất:
      </p>
      <CodeBlock>vercel --prod</CodeBlock>

      <hr />
      <p>
        Xem <a href="#">tài liệu CLI</a> để biết đầy đủ các lệnh.
      </p>
    </DocsLayout>
  )
}

import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'

const sections = [
  {
    id: 'overview',
    title: 'Velclaw là gì?',
    body: 'Velclaw là AI-native software workspace: người dùng tạo Task, agent thực thi trong sandbox, hệ thống thu thập kết quả, Review phân tích thay đổi, Gate quyết định điều kiện hợp nhất, rồi GitHub tạo và theo dõi pull request.',
  },
  {
    id: 'workflow',
    title: 'Task → Executor → Review → Gate → GitHub',
    body: 'Task là đơn vị công việc. Executor chạy agent và code trong workspace cô lập. Review tạo findings. Gate kiểm tra điều kiện. GitHub là lớp delivery cuối cùng để branch, commit, PR và trạng thái CI được truy vết.',
  },
  {
    id: 'mcp',
    title: 'MCP',
    body: 'MCP là extension layer cho agent. Velclaw lưu connector configuration, bind MCP server IDs vào task và truyền cấu hình vào executor khi agent chạy. Dùng trang MCP để thêm, sửa, bật hoặc tắt server.',
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    body: 'API Keys là credential layer cho provider. Key của người dùng được quản lý riêng với task prompt và không nên commit vào repository. Trang API Keys chỉ hiển thị trạng thái cấu hình và cung cấp thao tác lưu/xóa.',
  },
  {
    id: 'agents',
    title: 'Agents',
    body: 'Velclaw hỗ trợ nhiều agent/runtime qua adapter boundary. Core workflow không nên phụ thuộc cứng vào một provider. Agent nào chưa có adapter hoàn chỉnh phải được đánh dấu rõ ràng thay vì giả lập capability.',
  },
  {
    id: 'security',
    title: 'Security',
    body: 'Credentials phải đi qua secret-aware configuration. Execution phải nằm trong sandbox phù hợp. Log phải redact secret patterns. Thay đổi quan trọng cần đi qua review và CI trước khi merge.',
  },
  {
    id: 'domain',
    title: 'Domain',
    body: 'Domain canonical duy nhất của Velclaw hiện tại là velclaw.cfd. Tất cả public route, test gateway và ecosystem navigation phải dùng cùng hostname này.',
  },
] as const

export default async function VelclawWikiPage() {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin')

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW / WIKI</p>
          <h1 className="mt-2 text-2xl font-semibold">Velclaw Wiki</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Nguồn giải thích ngắn gọn về kiến trúc, workflow, MCP, API Keys, agent và các quy tắc vận hành của Velclaw.</p>
        </header>

        <nav className="grid gap-2 border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="border border-border/70 p-3 text-sm hover:border-violet-400/70 hover:bg-violet-500/5">
              {section.title}
            </a>
          ))}
        </nav>

        <div className="space-y-3">
          {sections.map((section, index) => (
            <article id={section.id} key={section.id} className="scroll-mt-6 border border-border bg-card p-5">
              <div className="flex gap-4">
                <span className="font-mono text-xs text-violet-300">0{index + 1}</span>
                <div>
                  <h2 className="text-base font-semibold">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

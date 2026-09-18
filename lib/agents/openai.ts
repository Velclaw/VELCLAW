import 'server-only'

import { Agent, OpenAIProvider, Runner } from '@openai/agents'
import { getUserApiKey } from '@/lib/api-keys/user-keys'

type AgentMode = 'single' | 'multi'

// Mở rộng Type để nhận thêm thông tin userId (cần thiết cho getUserApiKey)
type AgentRunInput = {
  userId: string
  message: string
  model?: string
  instructions?: string
  mode?: AgentMode
  maxConcurrentSubagents?: number
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isValidModelName(value: string) {
  return /^[A-Za-z0-9._:-]+$/.test(value)
}

function getOpenAIAgentModel(explicitModel?: string) {
  const model =
    cleanText(explicitModel, 120) ||
    cleanText(process.env.OPENAI_AGENTS_MODEL, 120) ||
    'gpt-4.1-mini'

  if (!model || !isValidModelName(model)) {
    throw new Error('OPENAI_AGENTS_MODEL is missing or invalid. Use a supported model name.')
  }

  return model
}

/**
 * Thực thi OpenAI Agent dựa trên cấu hình đầu vào
 * Thêm từ khóa 'export' ở đây để sửa lỗi build của Next.js
 */
export async function runOpenAIAgent(input: AgentRunInput) {
  const { userId, message, model, instructions, mode = 'single', maxConcurrentSubagents } = input

  // 1. Lấy API Key của người dùng
  const apiKey = await getUserApiKey(userId)
  if (!apiKey) {
    throw new Error('Không tìm thấy OpenAI API Key hợp lệ cho người dùng này.')
  }

  // 2. Xác định Model cần chạy
  const targetModel = getOpenAIAgentModel(model)

  // 3. Khởi tạo OpenAI Provider từ @openai/agents
  const provider = new OpenAIProvider({ apiKey })

  // 4. Cấu hình và tạo Agent
  const agent = new Agent({
    provider,
    model: targetModel,
    instructions: instructions || 'You are a helpful assistant.',
    // Nếu SDK hỗ trợ cấu hình trực tiếp số lượng subagents hoặc chế độ multi:
    ...(mode === 'multi' && {
      maxConcurrentSubagents: maxConcurrentSubagents || 3
    })
  })

  // 5. Chạy Agent với tin nhắn đầu vào bằng Runner
  const result = await Runner.run(agent, message)

  return result
}

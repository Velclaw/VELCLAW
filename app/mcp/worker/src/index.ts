import { createMcpHandler } from 'agents/mcp/server'
import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

interface Env {
  MCP_AUTH_TOKEN?: string
}

function createServer() {
  const server = new McpServer({
    name: 'velclaw-mcp',
    version: '0.1.0',
  })

  server.registerTool(
    'ping',
    {
      description: 'Check whether the Velclaw MCP server is responding.',
      inputSchema: {},
    },
    async () => ({
      content: [{ type: 'text' as const, text: 'pong' }],
    }),
  )

  server.registerTool(
    'echo',
    {
      description: 'Return the supplied message without modifying it.',
      inputSchema: { message: z.string().describe('Text to echo back') },
    },
    async ({ message }) => ({
      content: [{ type: 'text' as const, text: message }],
    }),
  )

  server.registerTool(
    'get_time',
    {
      description: 'Return the current server time in ISO 8601 UTC format.',
      inputSchema: {},
    },
    async () => ({
      content: [{ type: 'text' as const, text: new Date().toISOString() }],
    }),
  )

  return server
}

const mcpHandler = createMcpHandler(createServer)

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return Response.json({
        ok: true,
        service: 'velclaw-mcp',
        endpoint: '/mcp',
        authConfigured: Boolean(env.MCP_AUTH_TOKEN),
      })
    }

    if (url.pathname !== '/mcp') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // Configure MCP_AUTH_TOKEN as a Worker secret to require bearer authentication.
    // Keep this sample server limited to non-sensitive tools until portal auth is verified.
    if (env.MCP_AUTH_TOKEN) {
      const authorization = request.headers.get('Authorization')
      if (authorization !== `Bearer ${env.MCP_AUTH_TOKEN}`) {
        return new Response('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Bearer' },
        })
      }
    }

    return mcpHandler(request, env, ctx)
  },
} satisfies ExportedHandler<Env>

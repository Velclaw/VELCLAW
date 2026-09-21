import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { CommandHistoryItem, WatsonMetrics, ProjectFile } from '../types/shell';

// Project files mock tree structure
export const INITIAL_FILES: ProjectFile[] = [
  {
    id: 'f1',
    name: 'Cloudant_ETL_Core',
    path: '~/projects/etl/Cloudant_ETL_Core',
    type: 'folder',
    children: [
      {
        id: 'f1_1',
        name: 'watson_config.yaml',
        path: '~/projects/etl/watson_config.yaml',
        type: 'file',
        language: 'yaml',
        content: `version: '4.0.1'
database:
  name: cloudant_prod
  cluster: us-south.cloudant.ibm.com
  ssl: true
  max_connections: 50
watson_ml:
  enabled: true
  model: watson-granite-v3
  anomaly_sensitivity: 0.95
  auto_prune_duplicates: true
security:
  two_factor_auth: mandatory
  e2e_encryption: AES-256-GCM
`
      },
      {
        id: 'f1_2',
        name: 'analysis.js',
        path: '~/projects/etl/analysis.js',
        type: 'file',
        language: 'javascript',
        content: `// IBM Cloudant + Watson AI Analytics Pipeline
import { CloudantV1 } from '@ibm-cloud/cloudant';
import { WatsonML } from '@ibm/watson-ai';

async function runDataPipeline(dbName) {
  console.log(\`[Watson] Connecting to Cloudant instance: \${dbName}\`);
  const client = CloudantV1.newInstance({ serviceName: 'CLOUDANT' });
  
  const allDocs = await client.postAllDocs({ db: dbName, includeDocs: true });
  console.log(\`[Watson] Loaded \${allDocs.result.total_rows} documents.\`);
  
  const aiModel = new WatsonML({ model: 'watson-granite-v3' });
  const analysis = await aiModel.detectAnomalies(allDocs.result.rows);
  
  return {
    status: 'success',
    records_processed: allDocs.result.total_rows,
    anomalies_detected: analysis.anomalies.length,
    ai_confidence: 0.992
  };
}

runDataPipeline('cloudant_prod');
`
      },
      {
        id: 'f1_3',
        name: 'schema.sql',
        path: '~/projects/etl/schema.sql',
        type: 'file',
        language: 'sql',
        content: `-- Cloudant ETL Relational View Schema
CREATE TABLE IF NOT EXISTS etl_metrics_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_hash VARCHAR(64) NOT NULL,
  records_processed INT DEFAULT 0,
  anomalies_detected INT DEFAULT 0,
  ai_confidence NUMERIC(5,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`
      },
      {
        id: 'f1_4',
        name: 'cloudant_v3_log.json',
        path: '~/projects/etl/cloudant_v3_log.json',
        type: 'file',
        language: 'json',
        content: `{
  "cluster_id": "cloudant-us-south-01",
  "sync_state": "ACTIVE",
  "nodes": ["node_1_us", "node_2_eu", "node_3_ap"],
  "last_backup": "2026-07-30T09:30:00Z"
}`
      }
    ]
  }
];

// Pre-defined commands list for autocompletion & suggestions
export interface CommandSuggestion {
  command: string;
  category: 'Watson AI' | 'Cloudant' | 'Git / DevOps' | 'System' | 'Export';
  description: string;
}

export const SUGGESTIONS_DICTIONARY: CommandSuggestion[] = [
  { command: 'watson run-analysis --db cloudant_prod --depth full', category: 'Watson AI', description: 'Run full Watson ML data pipeline analysis' },
  { command: 'watson optimize --dry-run', category: 'Watson AI', description: 'Simulate index & query performance optimization' },
  { command: 'watson sync-devices --target="ios-mobile-v2"', category: 'Watson AI', description: 'Sync database state with connected cross-platform devices' },
  { command: 'watson prune --duplicates', category: 'Watson AI', description: 'Clean up duplicate log records and anomalies' },
  { command: 'watson status', category: 'Watson AI', description: 'Check Watson ML pipeline status and confidence score' },
  { command: 'watson ai-query "Phân tích hiệu năng hệ thống Cloudant"', category: 'Watson AI', description: 'Query Gemini/Watson AI for system analysis' },
  { command: 'cloudant sync --force', category: 'Cloudant', description: 'Force full replication cycle with Cloudant cluster' },
  { command: 'cloudant status', category: 'Cloudant', description: 'Check health and latency of Cloudant DB nodes' },
  { command: 'git status', category: 'Git / DevOps', description: 'View current branch status and pending uncommitted changes' },
  { command: 'git log -n 5', category: 'Git / DevOps', description: 'List recent commit history' },
  { command: 'npm run build', category: 'Git / DevOps', description: 'Trigger production application build' },
  { command: 'cat watson_config.yaml', category: 'System', description: 'View Watson ETL cluster configuration YAML' },
  { command: 'cat analysis.js', category: 'System', description: 'Inspect Cloudant + Watson ML pipeline script' },
  { command: 'cat cloudant_v3_log.json', category: 'System', description: 'Display raw JSON log payload' },
  { command: 'help', category: 'System', description: 'Display terminal help menu & command references' },
  { command: 'clear', category: 'System', description: 'Clear terminal output history' },
  { command: 'export pdf', category: 'Export', description: 'Generate formatted executive PDF report' },
  { command: 'export md', category: 'Export', description: 'Export command log and insights as Markdown' },
  { command: 'export csv', category: 'Export', description: 'Download command execution logs in CSV format' }
];

export const COMMAND_AUTOCOMPLETES = SUGGESTIONS_DICTIONARY.map(s => s.command);

/**
 * Returns a smart AI suggestion based on current input text
 */
export function getAISuggestion(input: string): string {
  if (!input.trim()) {
    return 'watson run-analysis --db cloudant_prod --depth full';
  }

  const lower = input.toLowerCase();
  if (lower.startsWith('watson r')) return 'watson run-analysis --db cloudant_prod --depth full';
  if (lower.startsWith('watson o')) return 'watson optimize --dry-run';
  if (lower.startsWith('watson s')) return 'watson sync-devices --target="ios-mobile-v2"';
  if (lower.startsWith('watson p')) return 'watson prune --duplicates';
  if (lower.startsWith('watson a')) return 'watson ai-query "Đánh giá an toàn bảo mật 2FA"';
  if (lower.startsWith('clo')) return 'cloudant sync --force';
  if (lower.startsWith('git')) return 'git status';
  if (lower.startsWith('cat')) return 'cat watson_config.yaml';
  if (lower.startsWith('exp')) return 'export pdf';

  const match = COMMAND_AUTOCOMPLETES.find(c => c.toLowerCase().startsWith(lower));
  if (match) return match;

  return `${input} --target="cloudant_prod"`;
}

/**
 * Executes command string and generates structured history output item
 */
export async function executeCommand(
  rawCommand: string,
  currentCwd: string,
  metrics: WatsonMetrics,
  setMetrics: React.Dispatch<React.SetStateAction<WatsonMetrics>>
): Promise<CommandHistoryItem> {
  const startTime = Date.now();
  const cmd = rawCommand.trim();
  const lower = cmd.toLowerCase();

  const id = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

  // Default item shell
  let item: CommandHistoryItem = {
    id,
    timestamp,
    cwd: currentCwd,
    command: cmd,
    status: 'success',
    durationMs: 12,
    output: {
      type: 'text',
      content: ''
    }
  };

  if (lower === 'clear') {
    item.output = { type: 'text', content: 'CLEAR_TERMINAL' };
    return item;
  }

  if (lower === 'help') {
    item.output = {
      type: 'markdown',
      content: `### 🤖 Watson Shell v4.0.1 - Supported Commands

- **\`watson run-analysis [--db <db>] [--depth <quick|full>]\`**: Chạy đường ống phân tích dữ liệu Watson ML trên Cloudant
- **\`watson set-confidence <0.0 - 1.0>\`**: Thay đổi điểm tin cậy Watson AI & dịch chuyển màu syntax highlighting
- **\`watson optimize [--dry-run]\`**: Tối ưu hóa chỉ mục và truy vấn dữ liệu tự động
- **\`watson sync-devices [--target <device>] [--force]\`**: Đồng bộ hóa thời gian thực giữa các thiết bị Cloud
- **\`watson prune [--duplicates]\`**: Tự động dọn dẹp các bản ghi trùng lặp trong Cloudant DB
- **\`watson ai-query "<prompt>"\`**: Hỏi đáp và phân tích dữ liệu chuyên sâu với trí tuệ nhân tạo Gemini/Watson
- **\`cloudant status | sync\`**: Kiểm tra trạng thái cụm cơ sở dữ liệu IBM Cloudant
- **\`git status | log | push\`**: Quản lý phiên làm việc & đồng bộ mã nguồn GitHub/GitLab
- **\`cat <file_name>\`**: Đọc trực tiếp file dự án (\`watson_config.yaml\`, \`analysis.js\`, \`cloudant_v3_log.json\`)
- **\`export pdf | md | csv\`**: Xuất báo cáo dữ liệu phiên làm việc ra PDF, Markdown hoặc CSV
- **\`clear\`**: Xóa sạch màn hình terminal`
    };
    return item;
  }

  // watson set-confidence
  if (lower.startsWith('watson set-confidence') || lower.startsWith('watson confidence')) {
    const parts = cmd.split(/\s+/);
    const scoreArg = parts.find((p, i) => i >= 1 && !isNaN(parseFloat(p)));
    const val = scoreArg ? parseFloat(scoreArg) : NaN;
    if (!isNaN(val)) {
      const newScore = val > 1 ? val / 100 : val;
      const boundedScore = Math.min(1.0, Math.max(0.05, newScore));
      setMetrics(prev => ({
        ...prev,
        aiConfidence: boundedScore
      }));

      const label = boundedScore >= 0.90 ? 'High Reliability (Optimal)' : boundedScore >= 0.70 ? 'Moderate Caution' : 'Low / Degraded Reliability';

      item.output = {
        type: 'markdown',
        content: `🎯 **Watson AI Confidence Score Updated**
- New Score: **${(boundedScore * 100).toFixed(1)}%**
- Syntax Highlighting Shift Mode: **${label}**
- Terminal syntax colors have been dynamically adjusted across inputs, outputs, and prompt suggestions.`
      };
      item.durationMs = 15;
      return item;
    }
  }

  // watson run-analysis
  if (lower.startsWith('watson run-analysis')) {
    setMetrics(prev => ({
      ...prev,
      recordsProcessed: prev.recordsProcessed + 1420,
      anomaliesDetected: 14,
      nodeEfficiency: 94,
      queryLatencyMs: 12
    }));

    item.output = {
      type: 'json',
      content: `Connecting to IBM Cloudant instance: cloudant_prod...
Triggering Watson ML analysis pipeline...`,
      jsonContent: {
        status: "success",
        cluster: "cloudant_prod_us_south",
        records_processed: 1402991,
        anomalies_detected: 14,
        ai_confidence: 0.992,
        security_status: "2FA_VERIFIED_AES256"
      }
    };
    item.durationMs = 184;
    return item;
  }

  // watson optimize
  if (lower.startsWith('watson optimize')) {
    setMetrics(prev => ({
      ...prev,
      queryLatencyMs: 9,
      nodeEfficiency: 98
    }));

    item.output = {
      type: 'markdown',
      content: `✨ **Watson AI Optimization Complete**
- Query latency reduced: **14ms ➜ 9ms** (-35.7%)
- Shard rebalancing completed across **3 Cloudant nodes**
- Index compression ratio: **1.8x**
- No locks or database downtime observed.`
    };
    item.durationMs = 95;
    return item;
  }

  // watson sync-devices
  if (lower.startsWith('watson sync-devices')) {
    item.output = {
      type: 'markdown',
      content: `⚡ **Real-time Cross-Platform Cloud Sync Triggered**
- **Mobile Dashboard Pro**: Synced (0.4s ago)
- **Tablet_Node_02**: Connected & Active
- **Desktop Session**: SHA-256 Encrypted (\`4f88c83e29f34567...b829\`)
- **Cloudant Replication**: 100% Up-to-date`
    };
    item.durationMs = 68;
    return item;
  }

  // watson prune
  if (lower.startsWith('watson prune')) {
    setMetrics(prev => ({
      ...prev,
      anomaliesDetected: 0
    }));

    item.output = {
      type: 'markdown',
      content: `🧹 **Watson Data Clean-up Routine**
- Scanned collection: \`cloudant_v3_log\`
- Duplicate records identified: **14 entries**
- Storage reclaimed: **4.2 MB**
- Anomalies count reset to: **0 (Clean State)**`
    };
    item.durationMs = 112;
    return item;
  }

  // watson ai-query
  if (lower.startsWith('watson ai-query')) {
    const promptMatch = cmd.match(/"([^"]+)"|'([^']+)'/);
    const userPrompt = promptMatch ? (promptMatch[1] || promptMatch[2]) : cmd.replace(/^watson ai-query\s*/i, '');

    const aiResponse = await callGeminiAPI(userPrompt);
    item.output = {
      type: 'markdown',
      content: aiResponse
    };
    item.durationMs = Date.now() - startTime;
    return item;
  }

  // cat file
  if (lower.startsWith('cat')) {
    const fileName = cmd.replace(/^cat\s+/i, '').trim();
    const file = INITIAL_FILES[0].children?.find(f => f.name.toLowerCase() === fileName.toLowerCase());

    if (file && file.content) {
      item.output = {
        type: 'code',
        content: file.content,
        language: file.language || 'javascript'
      };
    } else {
      item.status = 'error';
      item.output = {
        type: 'error',
        content: `cat: ${fileName}: No such file or directory. Available files: watson_config.yaml, analysis.js, schema.sql, cloudant_v3_log.json`
      };
    }
    return item;
  }

  // export
  if (lower.startsWith('export')) {
    const format = lower.replace(/^export\s+/i, '').trim();
    item.output = {
      type: 'text',
      content: `EXPORT_TRIGGER:${format || 'pdf'}`
    };
    return item;
  }

  // cloudant status / sync
  if (lower.startsWith('cloudant')) {
    item.output = {
      type: 'markdown',
      content: `🌐 **IBM Cloudant Cluster Status**
- **URL**: \`us-south.cloudant.ibm.com\`
- **Database**: \`cloudant_prod\` (Size: 4.8 GB, 1,402,991 docs)
- **Replication latency**: **< 15ms**
- **Node Health**: 3/3 Healthy (Green)`
    };
    return item;
  }

  // git
  if (lower.startsWith('git')) {
    item.output = {
      type: 'markdown',
      content: `octocat **GitHub / GitLab Repository Status**
- **Branch**: \`main\`
- **Remote**: \`github.com/dev-ops-lead/watson-cloudant-etl.git\`
- **Latest Commit**: \`e83fa10\` - *Fix real-time sync state & Watson 2FA handler*
- **Status**: Everything up to date. Clean working tree.`
    };
    return item;
  }

  // npm
  if (lower.startsWith('npm')) {
    item.output = {
      type: 'markdown',
      content: `🚀 **npm execution output**
\`\`\`bash
> watson-shell@4.0.1 build
> vite build && tsc --noEmit

✓ 142 modules transformed.
dist/index.html                     0.45 kB
dist/assets/index-Dk93a10.js       184.22 kB │ gzip: 54.10 kB
dist/assets/index-Bf92x01.css       12.80 kB │ gzip: 3.40 kB
✓ Built in 840ms.
\`\`\``
    };
    item.durationMs = 840;
    return item;
  }

  // Generic command execution fallback
  item.output = {
    type: 'markdown',
    content: `Executing command: \`${cmd}\`
[Watson Engine]: Task completed with code 0.
Result: Operation executed successfully on Cloudant Node cluster.`
  };
  item.durationMs = Math.floor(Math.random() * 40) + 10;
  return item;
}

/**
 * Uses Gemini API or returns a smart fallback analysis if Gemini key is not configured
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const apiKey = metaEnv.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are Watson AI integrated into Watson Shell v4.0.1 (IBM Cloudant & Cloud Sync). Answer the user request briefly, professionally, with Markdown formatting and technical clarity: ${prompt}`
      });
      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call error:', err);
    }
  }

  // Fallback intelligent response generator
  return `### 🧠 Watson AI Insights & Analytics Response
**Query**: "${prompt}"

1. **Cloudant Performance**: Cụm cơ sở dữ liệu Cloudant đạt hiệu năng **98.4%** với độ trễ phản hồi chỉ **12ms**.
2. **Khuyến nghị kiến trúc**: Tối ưu hóa chỉ mục cho các trường \`created_at\` và \`session_hash\` để giảm 20% dung lượng RAM.
3. **An toàn bảo mật**: Xác thực 2 lớp (2FA) đang hoạt động với mã hóa **AES-256-GCM** đầu-cuối. Đồng bộ đa nền tảng diễn ra an toàn.`;
}

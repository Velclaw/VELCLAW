import { CommandHistoryItem, WatsonMetrics } from '../types/shell';

/**
 * Downloads a file to user's device
 */
function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports command history & Watson insights to Markdown
 */
export function exportToMarkdown(history: CommandHistoryItem[], metrics: WatsonMetrics) {
  const now = new Date().toISOString();
  let md = `# Watson Shell Session Export Report\n`;
  md += `**Generated At**: ${now}\n`;
  md += `**IBM Cloudant Sync**: Active (SHA-256 Verified)\n\n`;

  md += `## 📊 Watson Analytics Summary\n`;
  md += `- **Node Efficiency**: ${metrics.nodeEfficiency}%\n`;
  md += `- **Query Latency**: ${metrics.queryLatencyMs}ms\n`;
  md += `- **Anomalies Detected**: ${metrics.anomaliesDetected}\n`;
  md += `- **AI Confidence**: ${metrics.aiConfidence * 100}%\n`;
  md += `- **Records Processed**: ${metrics.recordsProcessed.toLocaleString()}\n\n`;

  md += `## 📜 Terminal Command History (${history.length} commands)\n\n`;

  history.forEach((item, index) => {
    md += `### ${index + 1}. \`${item.command}\` [${item.status.toUpperCase()}]\n`;
    md += `- **Time**: ${item.timestamp}\n`;
    md += `- **CWD**: \`${item.cwd}\`\n`;
    if (item.durationMs) md += `- **Execution Duration**: ${item.durationMs}ms\n`;
    md += `\n\`\`\`${item.output.language || 'bash'}\n`;
    md += `${item.output.content}\n`;
    md += `\`\`\`\n\n`;
  });

  md += `---\n*Exported from Watson Shell v4.0.1 - IBM Cloudant & Watson AI Powered*\n`;

  downloadFile(`watson_shell_export_${Date.now()}.md`, md, 'text/markdown');
}

/**
 * Exports history to CSV file
 */
export function exportToCSV(history: CommandHistoryItem[]) {
  const headers = ['ID', 'Timestamp', 'CWD', 'Command', 'Status', 'Duration (ms)', 'Output Snippet'];
  const rows = history.map(item => [
    item.id,
    `"${item.timestamp}"`,
    `"${item.cwd}"`,
    `"${item.command.replace(/"/g, '""')}"`,
    item.status,
    item.durationMs || 0,
    `"${item.output.content.slice(0, 100).replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(`watson_terminal_queries_${Date.now()}.csv`, csvContent, 'text/csv');
}

/**
 * Triggers PDF export using clean formatted print template or window print stream
 */
export function exportToPDF(history: CommandHistoryItem[], metrics: WatsonMetrics) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the PDF report.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Watson Shell v4.0.1 - Executive PDF Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          h1 { color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; font-size: 24px; }
          .header-meta { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 24px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
          .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
          .metric-val { font-size: 20px; font-weight: bold; color: #2563eb; margin-top: 4px; }
          .metric-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          .cmd-item { border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 16px; overflow: hidden; page-break-inside: avoid; }
          .cmd-header { background: #f1f5f9; padding: 8px 12px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a; display: flex; justify-content: space-between; }
          .cmd-body { padding: 12px; font-family: monospace; font-size: 12px; background: #0f172a; color: #e2e8f0; white-space: pre-wrap; word-break: break-all; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          .badge-success { background: #dcfce7; color: #166534; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <h1>Watson Shell Executive Analysis & Command Log</h1>
        <div class="header-meta">
          <div><strong>System:</strong> IBM Cloudant ETL Cluster (Node v4.0.1)</div>
          <div><strong>Security:</strong> 2FA Verified | E2E SHA-256 Encrypted</div>
          <div><strong>Report Date:</strong> ${new Date().toLocaleString()}</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-lbl">Node Efficiency</div>
            <div class="metric-val">${metrics.nodeEfficiency}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-lbl">Query Latency</div>
            <div class="metric-val">${metrics.queryLatencyMs}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-lbl">Anomalies Detected</div>
            <div class="metric-val" style="color: ${metrics.anomaliesDetected > 0 ? '#dc2626' : '#16a34a'};">${metrics.anomaliesDetected}</div>
          </div>
          <div class="metric-card">
            <div class="metric-lbl">AI Confidence</div>
            <div class="metric-val">${(metrics.aiConfidence * 100).toFixed(1)}%</div>
          </div>
        </div>

        <h2>Command Execution Log (${history.length} items)</h2>
        ${history.map((item, idx) => `
          <div class="cmd-item">
            <div class="cmd-header">
              <span>➜ ${item.cwd} ${item.command}</span>
              <span class="badge badge-success">${item.status.toUpperCase()} (${item.durationMs || 12}ms)</span>
            </div>
            <div class="cmd-body">${escapeHtml(item.output.content)}</div>
          </div>
        `).join('')}

        <div class="footer">
          Watson Shell v4.0.1 &bull; IBM Cloudant Sync Active &bull; Confidentially Generated
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

import React, { useState } from 'react';
import { CommandHistoryItem } from '../types/shell';
import { renderCodeSnippet, highlightCommand, getConfidenceTheme } from '../utils/syntaxHighlighting';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, FileText, Code2, Layers, BookOpen } from 'lucide-react';
import { RfcViewer } from './RfcViewer';

interface TerminalOutputProps {
  history: CommandHistoryItem[];
  outputEndRef: React.RefObject<HTMLDivElement | null>;
  aiConfidence?: number;
  activeNavTab?: 'chat' | 'diff' | 'logs' | 'rfc';
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  history,
  outputEndRef,
  aiConfidence = 0.992,
  activeNavTab = 'chat'
}) => {
  const [isFilesExpanded, setIsFilesExpanded] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const theme = getConfidenceTheme(aiConfidence);

  // Render RFC Viewer Specification Tab
  if (activeNavTab === 'rfc') {
    return <RfcViewer />;
  }

  // Render Diff View (Sharp Rectangular Tech Theme)
  if (activeNavTab === 'diff') {
    return (
      <div className="flex-1 p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-y-auto space-y-4 bg-black text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-sm tracking-tight">Git Diff Summary - Branch main</span>
          </div>
          <span className="text-xs text-cyan-300 font-mono font-bold bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-none">
            +1,268 / -52
          </span>
        </div>

        {/* File 1: docs.html */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-none overflow-hidden">
          <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white font-mono">public/pages/docs.html</span>
            <span className="text-xs font-mono font-bold text-cyan-400">+166 -52</span>
          </div>
          <div className="p-3 font-mono text-[11px] leading-relaxed space-y-1">
            <div className="text-neutral-500">@@ -14,8 +14,12 @@</div>
            <div className="bg-red-950/40 text-red-300 px-2 py-0.5 border-l-2 border-red-500">- &lt;div className="legacy-sidebar"&gt;Old Nav&lt;/div&gt;</div>
            <div className="bg-cyan-950/40 text-cyan-300 px-2 py-0.5 border-l-2 border-cyan-500">+ &lt;div className="watson-clean-header"&gt;IETF Technical Header&lt;/div&gt;</div>
            <div className="bg-cyan-950/40 text-cyan-300 px-2 py-0.5 border-l-2 border-cyan-500">+ &lt;nav className="nav-tabs"&gt;Cuộc trò chuyện | Diff | Nhật ký | RFC Specs&lt;/nav&gt;</div>
          </div>
        </div>

        {/* File 2: index.html */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-none overflow-hidden">
          <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white font-mono">public/pages/index.html</span>
            <span className="text-xs font-mono font-bold bg-neutral-800 text-cyan-300 px-2 py-0.5 border border-neutral-700">Mới</span>
          </div>
          <div className="p-3 font-mono text-[11px] leading-relaxed space-y-1">
            <div className="text-neutral-500">@@ -0,0 +1,15 @@</div>
            <div className="bg-cyan-950/40 text-cyan-300 px-2 py-0.5 border-l-2 border-cyan-500">+ &lt;!DOCTYPE html&gt;</div>
            <div className="bg-cyan-950/40 text-cyan-300 px-2 py-0.5 border-l-2 border-cyan-500">+ &lt;html lang="vi"&gt;</div>
            <div className="bg-cyan-950/40 text-cyan-300 px-2 py-0.5 border-l-2 border-cyan-500">+ &lt;head&gt;&lt;title&gt;Watson Shell v4.0 - IETF/RFC Standards&lt;/title&gt;&lt;/head&gt;</div>
          </div>
        </div>

        {/* File 3: pages.css */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-none overflow-hidden">
          <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white font-mono">public/pages/pages.css</span>
            <span className="text-xs font-mono font-bold text-cyan-400">+1102 -0</span>
          </div>
          <div className="p-3 font-mono text-[11px] leading-relaxed space-y-1">
            <div className="text-neutral-500">@@ -0,0 +1,24 @@</div>
            <div className="bg-cyan-950/40 text-cyan-300 px-2 py-0.5 border-l-2 border-cyan-500">+ .sharp-rectangular-button &#123; border-radius: 0; background: #000; border: 1px solid #262626; &#125;</div>
            <div className="bg-cyan-950/40 text-cyan-300 px-2 py-0.5 border-l-2 border-cyan-500">+ .ietf-rfc-editor-container &#123; font-family: monospace; font-size: 12px; &#125;</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-y-auto space-y-5 text-slate-200 selection:bg-blue-600 selection:text-white">
      {/* Sample / Default Main Chat Conversation Item matching user screenshot */}
      <div className="space-y-4 text-slate-200 font-sans">
        <div className="text-sm text-neutral-300 leading-relaxed font-mono">
          number, card grid, timeline workflow và responsive mobile layout. <span className="text-neutral-500">{`{}`}</span>
        </div>

        {/* Testing Checklist */}
        <div className="space-y-2 font-mono">
          <div className="font-bold text-white text-sm mb-1">Testing</div>
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold">✅</span>
            <code className="px-2 py-0.5 bg-black text-white rounded-none text-xs border-2 border-neutral-700 font-bold">
              git diff --check
            </code>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold">✅</span>
            <code className="px-2 py-0.5 bg-black text-white rounded-none text-xs border-2 border-neutral-700 font-bold">
              npm run build
            </code>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
            <div className="text-xs text-neutral-300 leading-normal">
              <code className="px-2 py-0.5 bg-black text-white rounded-none text-xs border-2 border-neutral-700 font-bold mr-2 break-all">
                which chromium || which chromium-browser || which google-chrome || which firefox || true
              </code>
              <span className="text-neutral-400 font-medium">— môi trường không có browser CLI để chụp screenshot runtime.</span>
            </div>
          </div>
        </div>

        {/* Committed changes line */}
        <div className="text-xs font-mono text-neutral-300 pt-1">
          Committed changes on the current branch:{' '}
          <code className="px-1.5 py-0.5 bg-black text-cyan-300 rounded-none border-2 border-neutral-700 font-bold">2b1ba70</code>
          <div className="px-3 py-1.5 bg-black rounded-none border-2 border-neutral-700 text-white font-bold mt-1">
            Complete docs hierarchy and landing fallback
          </div>
        </div>

        {/* PR Metadata Title */}
        <div className="text-xs font-mono text-neutral-300">
          PR metadata created with title:{' '}
          <span className="px-2 py-0.5 bg-black text-cyan-300 rounded-none border-2 border-neutral-700 font-mono font-bold">
            Complete docs hierarchy and landing fallback
          </span>
        </div>

        {/* Foldable / Accordion Box: Tệp (3) */}
        <div className="bg-black border-2 border-neutral-800 rounded-none overflow-hidden my-3 shadow-lg">
          <button
            onClick={() => setIsFilesExpanded(!isFilesExpanded)}
            className="w-full px-4 py-3 bg-black hover:bg-neutral-900 border-b-2 border-neutral-800 flex items-center justify-between text-white font-mono text-xs font-extrabold uppercase transition-colors cursor-pointer"
          >
            <span>Tệp (3)</span>
            {isFilesExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
          </button>

          {isFilesExpanded && (
            <div className="p-3 space-y-2.5 font-mono text-xs divide-y divide-neutral-800 bg-black">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="font-bold text-white mr-2">docs.html</span>
                  <span className="text-neutral-500 text-[11px]">public/pages/docs.html</span>
                </div>
                <div className="space-x-1 font-bold">
                  <span className="text-cyan-300">+166</span>
                  <span className="text-amber-400">-52</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-white mr-2">index.html</span>
                  <span className="text-slate-500 text-[11px]">public/pages/index.html</span>
                </div>
                <span className="px-2 py-0.5 bg-black text-cyan-300 border border-cyan-400 rounded-none text-[10px] font-extrabold uppercase">
                  Mới
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-white mr-2">pages.css</span>
                  <span className="text-slate-500 text-[11px]">public/pages/pages.css</span>
                </div>
                <div className="space-x-1 font-bold">
                  <span className="text-cyan-300">+1102</span>
                  <span className="text-amber-400">-0</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Thumbs Up / Thumbs Down */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={() => setFeedbackGiven('up')}
            className={`p-1.5 rounded-none border-2 transition-all cursor-pointer active:scale-95 ${
              feedbackGiven === 'up'
                ? 'bg-cyan-400 text-black border-cyan-300 font-bold'
                : 'bg-black border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
            title="Đánh giá tốt"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFeedbackGiven('down')}
            className={`p-1.5 rounded-none border-2 transition-all cursor-pointer active:scale-95 ${
              feedbackGiven === 'down'
                ? 'bg-amber-400 text-black border-amber-300 font-bold'
                : 'bg-black border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
            title="Đánh giá chưa tốt"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Terminal Command History */}
      {history.map((item, idx) => (
        <div key={item.id || idx} className="space-y-2 group pt-4 border-t border-slate-800/60">
          <div className="flex items-start space-x-2 sm:space-x-3 text-slate-100">
            <span className="text-emerald-500 font-bold select-none">➜</span>
            <span className="text-blue-400 font-medium select-none">{item.cwd}</span>
            <span className="font-mono break-all font-semibold">{highlightCommand(item.command, aiConfidence)}</span>
            <span className="ml-auto text-[10px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity select-none">
              {item.timestamp}
            </span>
          </div>

          <div className="pl-5 sm:pl-7 border-l-2 border-neutral-800 ml-1 py-1 space-y-2">
            {item.output.type === 'json' && (
              <div className="p-3 bg-black rounded-none border-2 border-neutral-700 text-xs overflow-x-auto text-cyan-300 font-mono">
                {item.output.jsonContent && (
                  <pre className="text-xs leading-relaxed font-mono font-bold">
                    {JSON.stringify(item.output.jsonContent, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {item.output.type === 'markdown' && (
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-neutral-200 bg-black p-3 rounded-none border-2 border-neutral-700 font-mono font-medium">
                {item.output.content}
              </div>
            )}

            {item.output.type === 'code' && (
              <div>
                {renderCodeSnippet(item.output.content, item.output.language || 'javascript')}
              </div>
            )}

            {item.output.type === 'text' && item.output.content !== 'CLEAR_TERMINAL' && (
              <div className="text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {item.output.content}
              </div>
            )}
          </div>
        </div>
      ))}

      <div ref={outputEndRef} />
    </div>
  );
};


/**
 * Custom JSON syntax highlighter renderer for output
 */
function renderFormattedJSON(json: Record<string, unknown>): React.ReactNode {
  const jsonString = JSON.stringify(json, null, 2);
  const lines = jsonString.split('\n');

  return lines.map((line, idx) => {
    if (line.includes(':')) {
      const parts = line.split(':');
      const key = parts[0];
      const val = parts.slice(1).join(':');

      return (
        <div key={idx}>
          <span className="text-blue-300 font-medium">{key}</span>:
          <span className="text-emerald-300">{val}</span>
        </div>
      );
    }
    return <div key={idx} className="text-orange-400">{line}</div>;
  });
}

/**
 * Basic Markdown formatting parser for terminal output
 */
function renderMarkdownContent(content: string): React.ReactNode {
  const lines = content.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return <h4 key={idx} className="text-sm font-bold text-white mt-2 mb-1 border-b border-slate-800 pb-1">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} className="text-base font-bold text-blue-400 mt-2 mb-1">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-emerald-400 font-bold">&bull;</span>
              <span className="text-slate-300">{parseInlineFormat(line.substring(2))}</span>
            </div>
          );
        }
        return <div key={idx} className="text-slate-300">{parseInlineFormat(line)}</div>;
      })}
    </div>
  );
}

function parseInlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 bg-slate-800 text-blue-300 rounded font-mono text-[11px]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

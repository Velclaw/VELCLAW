import React from 'react';

export interface ConfidenceTheme {
  level: 'high' | 'moderate' | 'low';
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  mainCmd: string;
  fallbackCmd: string;
  flag: string;
  stringVal: string;
  keyValue: string;
  subCmd: string;
  numberVal: string;
  defaultText: string;
}

export function getConfidenceTheme(aiConfidence: number = 0.992): ConfidenceTheme {
  const norm = aiConfidence > 1 ? aiConfidence / 100 : aiConfidence;

  if (norm >= 0.90) {
    return {
      level: 'high',
      label: 'High Reliability',
      badgeBg: 'bg-emerald-950/80',
      badgeBorder: 'border-emerald-800/60',
      badgeText: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      mainCmd: 'text-blue-400 font-bold',
      fallbackCmd: 'text-emerald-400 font-bold',
      flag: 'text-purple-400 font-medium',
      stringVal: 'text-emerald-300',
      keyValue: 'text-orange-300',
      subCmd: 'text-cyan-300 font-medium',
      numberVal: 'text-amber-400',
      defaultText: 'text-slate-200'
    };
  } else if (norm >= 0.70) {
    return {
      level: 'moderate',
      label: 'Moderate Caution',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-800/60',
      badgeText: 'text-amber-400',
      dotColor: 'bg-amber-400',
      mainCmd: 'text-amber-400 font-bold',
      fallbackCmd: 'text-yellow-400 font-bold',
      flag: 'text-violet-400 font-medium',
      stringVal: 'text-lime-300',
      keyValue: 'text-amber-300',
      subCmd: 'text-amber-300 font-medium',
      numberVal: 'text-orange-400',
      defaultText: 'text-slate-200'
    };
  } else {
    return {
      level: 'low',
      label: 'Low / Degraded',
      badgeBg: 'bg-rose-950/80',
      badgeBorder: 'border-rose-800/60',
      badgeText: 'text-rose-400',
      dotColor: 'bg-rose-400',
      mainCmd: 'text-rose-400 font-bold',
      fallbackCmd: 'text-orange-400 font-bold',
      flag: 'text-fuchsia-400 font-medium',
      stringVal: 'text-amber-300',
      keyValue: 'text-rose-300',
      subCmd: 'text-rose-300 font-medium',
      numberVal: 'text-red-400',
      defaultText: 'text-slate-300'
    };
  }
}

/**
 * Parses a terminal command string and returns highlighted JSX spans dynamically shifted by Watson AI confidence score
 */
export function highlightCommand(command: string, aiConfidence: number = 0.992): React.ReactNode {
  if (!command.trim()) return <span className="text-slate-300">{command}</span>;

  const theme = getConfidenceTheme(aiConfidence);
  const tokens = command.split(/(\s+)/);
  let isFirstWord = true;

  return tokens.map((token, idx) => {
    if (/^\s+$/.test(token)) {
      return <span key={idx}>{token}</span>;
    }

    if (isFirstWord) {
      isFirstWord = false;
      // Main executable command
      if (['watson', 'cloudant', 'git', 'npm', 'node', 'cat', 'ls', 'help', 'clear', 'export', 'curl', 'python', 'docker'].includes(token.toLowerCase())) {
        return <span key={idx} className={theme.mainCmd}>{token}</span>;
      }
      return <span key={idx} className={theme.fallbackCmd}>{token}</span>;
    }

    // Flags like --depth, -f, --force, --dry-run
    if (token.startsWith('-')) {
      return <span key={idx} className={theme.flag}>{token}</span>;
    }

    // Quoted strings "..." or '...'
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return <span key={idx} className={theme.stringVal}>{token}</span>;
    }

    // Key=value pairs or paths
    if (token.includes('=') || token.includes('/')) {
      return <span key={idx} className={theme.keyValue}>{token}</span>;
    }

    // Subcommands or arguments
    if (['run-analysis', 'optimize', 'sync-devices', 'prune', 'status', 'push', 'commit', 'build', 'test', 'logs', 'ai-query', 'set-confidence'].includes(token.toLowerCase())) {
      return <span key={idx} className={theme.subCmd}>{token}</span>;
    }

    // Numbers
    if (/^\d+(\.\d+)?$/.test(token)) {
      return <span key={idx} className={theme.numberVal}>{token}</span>;
    }

    return <span key={idx} className={theme.defaultText}>{token}</span>;
  });
}

/**
 * Basic syntax highlighter for code snippets in Markdown / JSON / JS / Python / YAML / SQL
 */
export function renderCodeSnippet(code: string, language = 'javascript'): React.ReactNode {
  const lines = code.split('\n');

  return (
    <pre className="text-xs font-mono leading-relaxed bg-[#111622] p-3 rounded-lg border border-slate-800/80 overflow-x-auto my-2 text-slate-200">
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className="table-row">
          <span className="table-cell pr-4 text-slate-600 select-none text-right w-8 text-[11px]">{lineIdx + 1}</span>
          <span className="table-cell pl-2">
            {highlightCodeLine(line, language)}
          </span>
        </div>
      ))}
    </pre>
  );
}

function highlightCodeLine(line: string, language: string): React.ReactNode {
  if (language === 'json') {
    const jsonKeyRegex = /^(\s*)("[^"]+"):/ ;
    const match = line.match(jsonKeyRegex);
    if (match) {
      const rest = line.substring(match[0].length);
      return (
        <span>
          {match[1]}
          <span className="text-blue-300 font-semibold">{match[2]}</span>:
          {highlightValue(rest)}
        </span>
      );
    }
  }

  const keywords = ['const', 'let', 'var', 'function', 'return', 'import', 'from', 'export', 'default', 'async', 'await', 'if', 'else', 'for', 'while', 'class', 'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'def'];
  
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  const parts = line.split(/(\b(?:const|let|var|function|return|import|from|export|default|async|await|if|else|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|def)\b|"[^"]*"|'[^']*'|`[^`]*`|\d+)/g);

  return parts.map((part, idx) => {
    if (keywords.includes(part)) {
      return <span key={idx} className="text-purple-400 font-medium">{part}</span>;
    }
    if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
      return <span key={idx} className="text-emerald-300">{part}</span>;
    }
    if (/^\d+$/.test(part)) {
      return <span key={idx} className="text-amber-400">{part}</span>;
    }
    if (part.includes('{') || part.includes('}') || part.includes('[') || part.includes(']')) {
      return <span key={idx} className="text-orange-400">{part}</span>;
    }
    return <span key={idx} className="text-slate-200">{part}</span>;
  });
}

function highlightValue(val: string): React.ReactNode {
  const trimmed = val.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('",')) {
    return <span className="text-emerald-300"> {trimmed}</span>;
  }
  if (trimmed === 'true,' || trimmed === 'false,' || trimmed === 'true' || trimmed === 'false') {
    return <span className="text-purple-300"> {trimmed}</span>;
  }
  if (!isNaN(Number(trimmed.replace(',', '')))) {
    return <span className="text-amber-300"> {trimmed}</span>;
  }
  return <span className="text-slate-200"> {val}</span>;
}

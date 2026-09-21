import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Terminal, Shield, Sparkles, BookOpen } from 'lucide-react';

interface TerminalInputProps {
  onExecute: (command: string) => void;
  onClear: () => void;
  onToggleGraph?: () => void;
  onToggleLogs?: () => void;
  historyCommands: string[];
  aiConfidence?: number;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  onExecute,
  onClear,
  historyCommands,
  aiConfidence = 0.992
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [savedInput, setSavedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    onExecute(input);
    setInput('');
    setHistoryIndex(-1);
    setSavedInput('');
  };

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // 1. Ctrl + L -> Clear terminal
    if (isCtrlOrCmd && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      onClear();
      return;
    }

    // 2. Ctrl + C -> Cancel / Interrupt current process or line
    if (isCtrlOrCmd && e.key.toLowerCase() === 'c') {
      // If user selected text, allow standard copy
      const selectedText = window.getSelection()?.toString();
      if (selectedText) return;

      e.preventDefault();
      if (input.trim()) {
        // Clear input line and signal cancel
        setInput('');
        onExecute('^C (Cancelled command)');
      } else {
        // Interrupt signal to active process
        onExecute('^C');
      }
      setHistoryIndex(-1);
      return;
    }

    // 3. Ctrl + U -> Clear line before cursor
    if (isCtrlOrCmd && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      const cursor = inputRef.current?.selectionStart ?? input.length;
      setInput(input.slice(cursor));
      return;
    }

    // 4. Ctrl + K -> Clear line from cursor to end
    if (isCtrlOrCmd && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const cursor = inputRef.current?.selectionStart ?? 0;
      if (cursor === 0 && input === '') {
        // If empty input, treat Ctrl+K as clear
        onClear();
      } else {
        setInput(input.slice(0, cursor));
      }
      return;
    }

    // 5. Ctrl + W -> Erase word backwards
    if (isCtrlOrCmd && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      const cursor = inputRef.current?.selectionStart ?? input.length;
      const beforeCursor = input.slice(0, cursor).trimEnd();
      const lastSpaceIndex = beforeCursor.lastIndexOf(' ');
      const newBefore = lastSpaceIndex >= 0 ? beforeCursor.slice(0, lastSpaceIndex + 1) : '';
      setInput(newBefore + input.slice(cursor));
      return;
    }

    // 6. Ctrl + A -> Jump to beginning of line
    if (isCtrlOrCmd && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      inputRef.current?.setSelectionRange(0, 0);
      return;
    }

    // 7. Ctrl + E -> Jump to end of line
    if (isCtrlOrCmd && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      const len = input.length;
      inputRef.current?.setSelectionRange(len, len);
      return;
    }

    // 8. Tab -> Autocomplete common commands
    if (e.key === 'Tab') {
      e.preventDefault();
      const commonCommands = ['watson run-analysis', 'git diff', 'npm run build', 'watson optimize', 'help', 'clear'];
      const match = commonCommands.find(c => c.startsWith(input.trim()));
      if (match) {
        setInput(match);
      }
      return;
    }

    // 9. ArrowUp -> Navigate command history (older)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyCommands.length === 0) return;

      if (historyIndex === -1) {
        setSavedInput(input);
      }

      const nextIndex = historyIndex + 1;
      if (nextIndex < historyCommands.length) {
        setHistoryIndex(nextIndex);
        setInput(historyCommands[historyCommands.length - 1 - nextIndex]);
      }
      return;
    }

    // 10. ArrowDown -> Navigate command history (newer)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(historyCommands[historyCommands.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput(savedInput);
      }
      return;
    }
  };

  return (
    <div className="p-2 sm:p-3 bg-black border-t-2 border-neutral-800 sticky bottom-0 z-20 select-none font-mono">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex flex-col gap-1.5">
        {/* Quick RFC Standard Shortcut Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[10px]">
          <span className="text-neutral-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-cyan-400" />
            RFC Standard:
          </span>
          <button
            type="button"
            onClick={() => setInput('rfc 9110 (HTTP Semantics)')}
            className="px-2.5 py-1 bg-cyan-400 text-black font-extrabold border-2 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)] rounded-none shrink-0 transition-all cursor-pointer active:scale-95 uppercase"
          >
            RFC 9110 HTTP
          </button>
          <button
            type="button"
            onClick={() => setInput('rfc 8446 (TLS 1.3 Encryption)')}
            className="px-2.5 py-1 bg-black hover:bg-neutral-900 text-cyan-300 font-bold border-2 border-neutral-700 hover:border-cyan-400 rounded-none shrink-0 transition-all cursor-pointer active:scale-95 uppercase"
          >
            RFC 8446 TLS 1.3
          </button>
          <button
            type="button"
            onClick={() => setInput('rfc 6749 (OAuth 2.0 Auth)')}
            className="px-2.5 py-1 bg-black hover:bg-neutral-900 text-cyan-300 font-bold border-2 border-neutral-700 hover:border-cyan-400 rounded-none shrink-0 transition-all cursor-pointer active:scale-95 uppercase"
          >
            RFC 6749 OAuth
          </button>
          <button
            type="button"
            onClick={() => setInput('rfc 6455 (WebSocket Protocol)')}
            className="px-2.5 py-1 bg-black hover:bg-neutral-900 text-cyan-300 font-bold border-2 border-neutral-700 hover:border-cyan-400 rounded-none shrink-0 transition-all cursor-pointer active:scale-95 uppercase"
          >
            RFC 6455 WebSockets
          </button>
        </div>

        {/* Sharp Rectangular Input Box Container */}
        <div className={`w-full bg-black border-2 transition-all duration-150 rounded-none p-1 pl-2 flex items-center ${
          isFocused ? 'border-cyan-400 bg-black shadow-[0_0_15px_rgba(34,211,238,0.25)]' : 'border-neutral-700 hover:border-neutral-500'
        }`}>
          {/* Sharp Rectangular Plus (+) Attachment Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-none bg-black hover:bg-neutral-900 flex items-center justify-center text-cyan-300 hover:text-white transition-all shrink-0 cursor-pointer border-2 border-neutral-700 hover:border-cyan-400 active:scale-95"
            title="Thêm tệp hoặc thành phần (+)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Main Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Yêu cầu thay đổi, tra cứu RFC hoặc đặt câu hỏi..."
            className="flex-1 bg-transparent px-2.5 py-1 text-xs sm:text-sm text-white font-mono font-medium placeholder-neutral-500 focus:outline-none tracking-tight"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Sharp Rectangular Send Button with Cyan Glow */}
          <button
            type="submit"
            disabled={!input.trim()}
            className={`h-8 px-4 rounded-none font-extrabold text-xs uppercase tracking-wider transition-all duration-150 flex items-center space-x-1.5 shrink-0 ${
              input.trim()
                ? 'bg-cyan-400 text-black hover:bg-cyan-300 cursor-pointer border-2 border-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.6)] active:scale-95 font-mono'
                : 'bg-black text-neutral-600 border-2 border-neutral-800 cursor-not-allowed'
            }`}
            title="Gửi câu hỏi (Enter)"
          >
            <span className="font-extrabold text-xs tracking-widest">GỬI</span>
            <div className={`w-4 h-4 rounded-none flex items-center justify-center transition-colors ${
              input.trim() ? 'bg-black text-cyan-300' : 'bg-neutral-900 text-neutral-600'
            }`}>
              <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>

        {/* Terminal Shortcuts Quick Helper Footer */}
        <div className="flex flex-wrap items-center justify-between px-1 text-[10px] font-mono text-neutral-500 gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1 hover:text-neutral-300 transition-colors cursor-help" title="Xóa toàn bộ màn hình Terminal">
              <kbd className="px-1 py-0.5 bg-neutral-900 rounded-none text-[9px] text-neutral-300 border border-neutral-800">Ctrl+L</kbd> Clear
            </span>
            <span className="flex items-center gap-1 hover:text-neutral-300 transition-colors cursor-help" title="Dừng hoặc hủy lệnh đang chạy">
              <kbd className="px-1 py-0.5 bg-neutral-900 rounded-none text-[9px] text-neutral-300 border border-neutral-800">Ctrl+C</kbd> Cancel
            </span>
            <span className="hidden sm:flex items-center gap-1 hover:text-neutral-300 transition-colors cursor-help" title="Xem lại lịch sử lệnh đã thực thi">
              <kbd className="px-1 py-0.5 bg-neutral-900 rounded-none text-[9px] text-neutral-300 border border-neutral-800">↑↓</kbd> History
            </span>
            <span className="hidden md:flex items-center gap-1 hover:text-neutral-300 transition-colors cursor-help" title="Tự động hoàn thành dòng lệnh">
              <kbd className="px-1 py-0.5 bg-neutral-900 rounded-none text-[9px] text-neutral-300 border border-neutral-800">Tab</kbd> Complete
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-neutral-500">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>IETF / RFC Technical Terminal</span>
          </div>
        </div>
      </form>
    </div>
  );
};




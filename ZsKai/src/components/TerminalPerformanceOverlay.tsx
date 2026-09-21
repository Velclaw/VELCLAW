import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Activity, Gauge, Zap, Sparkles } from 'lucide-react';
import { getConfidenceTheme } from '../utils/syntaxHighlighting';

interface TerminalPerformanceOverlayProps {
  latencyMs?: number;
  aiConfidence?: number;
  onSetConfidence?: (score: number) => void;
}

export const TerminalPerformanceOverlay: React.FC<TerminalPerformanceOverlayProps> = ({
  latencyMs = 18,
  aiConfidence = 0.992,
  onSetConfidence
}) => {
  const [memoryMB, setMemoryMB] = useState(42.8);
  const [currentLatency, setCurrentLatency] = useState(latencyMs);
  const [cpuUsage, setCpuUsage] = useState(3.4);
  const [showDetails, setShowDetails] = useState(false);

  const theme = getConfidenceTheme(aiConfidence);

  // Simulate subtle real-time performance fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryMB(prev => {
        const delta = (Math.random() - 0.48) * 0.8;
        return Math.min(96, Math.max(28, parseFloat((prev + delta).toFixed(1))));
      });

      setCurrentLatency(prev => {
        const base = latencyMs || 18;
        const delta = Math.floor((Math.random() - 0.5) * 6);
        return Math.max(6, base + delta);
      });

      setCpuUsage(prev => {
        const delta = (Math.random() - 0.5) * 1.2;
        return Math.min(25, Math.max(1.2, parseFloat((prev + delta).toFixed(1))));
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [latencyMs]);

  const maxMemory = 128;
  const memoryPct = Math.min(100, Math.round((memoryMB / maxMemory) * 100));

  // Latency status color
  const latencyColor = currentLatency < 30 ? 'text-emerald-400' : currentLatency < 80 ? 'text-amber-400' : 'text-rose-400';
  const latencyDotColor = currentLatency < 30 ? 'bg-emerald-500' : currentLatency < 80 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="relative font-mono text-[10px] select-none">
      {/* Overlay Bar */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2.5 bg-[#0A0E14]/90 hover:bg-[#0F141C] border border-[#2D3748]/80 hover:border-blue-500/50 px-2.5 py-1 rounded-md cursor-pointer transition-all shadow-sm"
        title="Click for detailed session performance breakdown & syntax color shift controls"
      >
        {/* Latency metric */}
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${latencyDotColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${latencyDotColor}`}></span>
          </span>
          <Wifi className="w-3 h-3 text-slate-400" />
          <span className={`font-bold ${latencyColor}`}>{currentLatency}ms</span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Memory Usage */}
        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3 h-3 text-blue-400" />
          <span className="text-slate-300 font-medium">
            <span className="text-slate-100 font-bold">{memoryMB}</span>
            <span className="text-slate-500 text-[9px] ml-0.5">MB</span>
          </span>
          {/* Mini progress bar */}
          <div className="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden md:block border border-slate-700/50">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                memoryPct > 80 ? 'bg-rose-500' : memoryPct > 60 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${memoryPct}%` }}
            />
          </div>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* CPU % */}
        <div className="hidden sm:flex items-center space-x-1 text-slate-400">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>{cpuUsage}%</span>
        </div>

        <span className="text-slate-700 hidden md:inline">|</span>

        {/* AI Confidence & Syntax Shift Badge */}
        <div className="hidden md:flex items-center space-x-1 text-slate-300" title={`AI Confidence: ${(aiConfidence * 100).toFixed(1)}% (${theme.label})`}>
          <Sparkles className={`w-3 h-3 ${theme.badgeText}`} />
          <span className={`font-bold ${theme.badgeText}`}>{(aiConfidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Detailed Modal/Dropdown Popover */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0F141C] border border-blue-500/40 rounded-lg p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-800 text-slate-300">
          <div className="pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Session Performance
            </span>
            <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50 font-bold uppercase tracking-wider">
              Healthy
            </span>
          </div>

          <div className="py-2.5 space-y-2.5 text-[10px]">
            {/* Memory breakdown */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>V8 Heap Allocated</span>
                <span className="font-bold text-white">{memoryMB} MB / {maxMemory} MB</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${memoryPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[9px]">
              <div className="bg-[#141A24] p-1.5 rounded border border-slate-800">
                <div className="text-slate-500">AST & Command Cache</div>
                <div className="text-slate-200 font-bold font-mono">12.4 MB</div>
              </div>
              <div className="bg-[#141A24] p-1.5 rounded border border-slate-800">
                <div className="text-slate-500">Watson Buffer</div>
                <div className="text-slate-200 font-bold font-mono">18.2 MB</div>
              </div>
            </div>

            {/* Network Latency details */}
            <div className="pt-1">
              <div className="flex justify-between text-slate-400">
                <span>Node Roundtrip Latency</span>
                <span className={`font-bold ${latencyColor}`}>{currentLatency} ms</span>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                <span>Jitter: &lt;1.2ms</span>
                <span>Loss: 0.0%</span>
              </div>
            </div>

            {/* AI Confidence & Dynamic Syntax Highlighting Shift */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className={`w-3 h-3 ${theme.badgeText}`} />
                  Watson AI Confidence
                </span>
                <span className={`font-bold text-[11px] ${theme.badgeText}`}>
                  {(aiConfidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className={`p-1.5 rounded border text-[9.5px] ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} flex justify-between items-center`}>
                <span>Syntax Color Shift:</span>
                <span className="font-bold uppercase tracking-wider">{theme.label}</span>
              </div>

              {onSetConfidence && (
                <div className="pt-1">
                  <div className="text-[9px] text-slate-500 mb-1">Test Confidence Shifting:</div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetConfidence(0.992);
                      }}
                      className="px-1.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[9px] font-bold cursor-pointer transition-colors"
                    >
                      High 99%
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetConfidence(0.82);
                      }}
                      className="px-1.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded text-[9px] font-bold cursor-pointer transition-colors"
                    >
                      Med 82%
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetConfidence(0.55);
                      }}
                      className="px-1.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded text-[9px] font-bold cursor-pointer transition-colors"
                    >
                      Low 55%
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 text-[9px] text-slate-500 flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Live Stream Active
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(false);
              }}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Cpu, Activity, ShieldAlert, Smartphone, Tablet, ShieldCheck, Lock, ArrowRight, TrendingUp, Download, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { WatsonMetrics, DeviceSync } from '../types/shell';

interface SidebarWatsonAnalysisProps {
  metrics: WatsonMetrics;
  devices: DeviceSync[];
  onTriggerQuickCommand: (cmd: string) => void;
  encryptedHash: string;
}

export type TimeRange = '15m' | '1h' | '24h' | 'all';

interface HistoryPoint {
  time: string;
  timestamp: number;
  latency: number;
  efficiency: number;
}

export const SidebarWatsonAnalysis: React.FC<SidebarWatsonAnalysisProps> = ({
  metrics,
  devices,
  onTriggerQuickCommand,
  encryptedHash
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('15m');

  const [history, setHistory] = useState<HistoryPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 24 }).map((_, i) => {
      const timeOffsetMs = (23 - i) * 60 * 60 * 1000;
      const timestamp = now - timeOffsetMs;
      const t = new Date(timestamp);
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        time: timeStr,
        timestamp,
        latency: Math.max(8, metrics.queryLatencyMs + Math.floor((Math.random() - 0.5) * 12)),
        efficiency: Math.min(100, Math.max(70, metrics.nodeEfficiency + Math.floor((Math.random() - 0.5) * 8)))
      };
    });
  });

  useEffect(() => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistory(prev => {
      const last = prev[prev.length - 1];
      if (last && last.latency === metrics.queryLatencyMs && last.efficiency === metrics.nodeEfficiency) {
        return prev;
      }
      return [...prev, { time: timeStr, timestamp: now, latency: metrics.queryLatencyMs, efficiency: metrics.nodeEfficiency }];
    });
  }, [metrics.queryLatencyMs, metrics.nodeEfficiency]);

  const filteredHistory = useMemo(() => {
    if (history.length === 0) return [];
    const latestTimestamp = history[history.length - 1].timestamp;

    let rangeMs = Infinity;
    if (timeRange === '15m') rangeMs = 15 * 60 * 1000;
    else if (timeRange === '1h') rangeMs = 60 * 60 * 1000;
    else if (timeRange === '24h') rangeMs = 24 * 60 * 60 * 1000;

    if (rangeMs === Infinity) return history;

    const filtered = history.filter(p => latestTimestamp - p.timestamp <= rangeMs);
    if (filtered.length < 4) {
      return history.slice(-6);
    }
    return filtered;
  }, [history, timeRange]);

  const handleDownloadJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      encryptedHash,
      currentMetrics: metrics,
      devices,
      selectedTimeRange: timeRange,
      metricHistory: history
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `watson_metrics_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <aside className="w-full lg:w-72 bg-black border-l-2 border-neutral-800 flex flex-col h-full select-none overflow-y-auto text-white font-mono">
      <div className="p-5 space-y-6 flex-1">
        {/* Watson Performance Block */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-neutral-400 tracking-widest uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Watson Analysis
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadJSON}
                title="Download current metric history as JSON"
                className="flex items-center gap-1 px-2 py-0.5 bg-black hover:bg-neutral-900 text-cyan-300 rounded-none text-[10px] font-mono font-bold transition-all border-2 border-neutral-700 cursor-pointer active:scale-95"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>JSON</span>
              </button>
              <span className="text-[10px] text-cyan-300 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-none bg-cyan-400 animate-pulse"></span>
                {metrics.statusText}
              </span>
            </div>
          </div>

          <div className="bg-black rounded-none p-4 border-2 border-neutral-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <span className="text-xs font-bold text-white">System Performance</span>
              <span className="text-[10px] text-cyan-300 font-mono font-bold">
                {metrics.recordsProcessed.toLocaleString()} records
              </span>
            </div>

            {/* Node Efficiency */}
            <div className="relative pt-1">
              <div className="flex mb-1.5 items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-400 uppercase font-bold">Node Efficiency</span>
                <span className="text-white font-bold">{metrics.nodeEfficiency}%</span>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded-none bg-neutral-900 border border-neutral-700">
                <div
                  style={{ width: `${metrics.nodeEfficiency}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cyan-400 transition-all duration-500"
                ></div>
              </div>
            </div>

            {/* Query Latency */}
            <div className="relative pt-1">
              <div className="flex mb-1.5 items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-400 uppercase font-bold">Query Latency</span>
                <span className="text-cyan-300 font-bold">{metrics.queryLatencyMs}ms</span>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded-none bg-neutral-900 border border-neutral-700">
                <div
                  style={{ width: `${Math.min(100, (metrics.queryLatencyMs / 50) * 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cyan-400 transition-all duration-500"
                ></div>
              </div>
            </div>

            {/* AI Confidence & Anomalies */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-neutral-800 text-[10px]">
              <div className="bg-black p-2 rounded-none border border-neutral-700">
                <div className="text-neutral-400 uppercase font-bold">AI Confidence</div>
                <div className="text-cyan-300 font-bold text-xs font-mono">
                  {(metrics.aiConfidence * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-black p-2 rounded-none border border-neutral-700">
                <div className="text-neutral-400 uppercase font-bold">Anomalies</div>
                <div className={`font-bold text-xs font-mono ${metrics.anomaliesDetected > 0 ? 'text-amber-300' : 'text-cyan-300'}`}>
                  {metrics.anomaliesDetected} detected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Performance Trends Line Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-neutral-400 tracking-widest uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Performance Over Time
            </h3>

            {/* Time Range Selector Dropdown */}
            <div className="flex items-center gap-1 bg-black p-1 rounded-none border-2 border-neutral-700">
              <Clock className="w-3 h-3 text-cyan-400 ml-1" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="bg-black text-[10px] text-white font-mono font-bold focus:outline-none cursor-pointer py-0.5 pr-1"
              >
                <option value="15m" className="bg-black text-white">Last 15m</option>
                <option value="1h" className="bg-black text-white">Last 1h</option>
                <option value="24h" className="bg-black text-white">Last 24h</option>
                <option value="all" className="bg-black text-white">All Time</option>
              </select>
            </div>
          </div>

          <div className="bg-black rounded-none p-3 border-2 border-neutral-700 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono px-1">
              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                <span className="w-2 h-2 rounded-none bg-cyan-400 inline-block"></span> Latency (ms)
              </span>
              <span className="flex items-center gap-1 text-white font-bold">
                <span className="w-2 h-2 rounded-none bg-white inline-block"></span> Efficiency (%)
              </span>
            </div>

            <div className="h-36 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistory} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="time" stroke="#a3a3a3" fontSize={8} tickLine={false} axisLine={{ stroke: '#404040' }} />
                  <YAxis yAxisId="left" stroke="#22d3ee" fontSize={8} tickLine={false} axisLine={{ stroke: '#404040' }} domain={[0, 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffffff" fontSize={8} tickLine={false} axisLine={{ stroke: '#404040' }} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000000',
                      borderColor: '#404040',
                      borderRadius: '0px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                      color: '#ffffff'
                    }}
                    itemStyle={{ padding: '1px 0' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency (ms)" stroke="#22d3ee" strokeWidth={2} dot={{ r: 2, fill: '#22d3ee' }} activeDot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency (%)" stroke="#ffffff" strokeWidth={2} dot={{ r: 2, fill: '#ffffff' }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Real-time Sync Section */}
        <div>
          <h3 className="text-xs font-bold text-neutral-400 tracking-widest uppercase mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Real-time Sync
          </h3>

          <div className="space-y-2">
            {devices.map(dev => (
              <div
                key={dev.id}
                className="flex items-center justify-between p-2.5 rounded-none bg-black border-2 border-neutral-800"
              >
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-none mr-3 ${
                      dev.status === 'synced' ? 'bg-cyan-400' : 'bg-white animate-pulse'
                    }`}
                  ></div>
                  <div>
                    <div className="text-[11px] text-white font-bold flex items-center gap-1.5">
                      {dev.type === 'mobile' && <Smartphone className="w-3 h-3 text-cyan-400" />}
                      {dev.type === 'tablet' && <Tablet className="w-3 h-3 text-cyan-400" />}
                      {dev.name}
                    </div>
                    <div className="text-[9px] text-neutral-400 font-mono font-medium">
                      Synced {dev.lastSyncTime} &bull; {dev.ipAddress}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-black p-4 rounded-none border-2 border-neutral-700 shadow-lg">
          <div className="text-xs font-bold text-cyan-300 mb-2 flex items-center justify-between">
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-cyan-400" />
              AI INSIGHT
            </span>
            <span className="text-[9px] bg-neutral-900 text-cyan-300 px-1.5 py-0.5 border border-neutral-700 rounded-none font-mono font-bold">WATSON ML</span>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-200 font-medium">
            {metrics.anomaliesDetected > 0 ? (
              <>
                Detected <span className="text-amber-300 font-bold">{metrics.anomaliesDetected} duplicate entries</span> in <code className="text-cyan-300">cloudant_v3_log</code>.
              </>
            ) : (
              <>
                Cloudant cluster operating at <span className="text-cyan-300 font-bold">optimal efficiency</span>.
              </>
            )}
          </p>

          <button
            onClick={() => onTriggerQuickCommand(metrics.anomaliesDetected > 0 ? 'watson prune --duplicates' : 'watson optimize --dry-run')}
            className="mt-3 w-full flex items-center justify-between px-2.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 border-2 border-cyan-300 rounded-none text-xs text-black font-extrabold uppercase transition-all font-mono cursor-pointer active:scale-95"
          >
            <span>{metrics.anomaliesDetected > 0 ? 'Run Watson Prune' : 'Run Auto Optimize'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </div>

      {/* Session Security Footer */}
      <div className="p-4 border-t-2 border-neutral-800 bg-black">
        <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest font-mono font-bold">
          <span>Session Info</span>
          <span className="text-cyan-300 font-bold flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            ENCRYPTED
          </span>
        </div>
        <div className="mt-1 text-[10px] text-neutral-400 font-mono truncate select-all">
          SHA-256: {encryptedHash}
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { Folder, FileText, Download, FileCode, Clock, Plus, Database, Sparkles, FileSpreadsheet } from 'lucide-react';
import { ProjectFile, SavedSession } from '../types/shell';

interface SidebarProjectTreeProps {
  files: ProjectFile[];
  sessions: SavedSession[];
  selectedFileId: string | null;
  onSelectFile: (file: ProjectFile) => void;
  onSelectSession: (session: SavedSession) => void;
  onExportPDF: () => void;
  onExportMarkdown: () => void;
  onExportCSV: () => void;
  onNewSession: () => void;
  activeTab?: 'files' | 'sessions';
}

export const SidebarProjectTree: React.FC<SidebarProjectTreeProps> = ({
  files,
  sessions,
  selectedFileId,
  onSelectFile,
  onSelectSession,
  onExportPDF,
  onExportMarkdown,
  onExportCSV,
  onNewSession
}) => {
  return (
    <aside className="w-full lg:w-64 bg-black border-r-2 border-neutral-800 flex flex-col h-full select-none overflow-y-auto font-mono text-white">
      <div className="p-4 flex-1 space-y-6">
        {/* Project Tree Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">Project Tree</span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">ETL v4.0</span>
          </div>

          <nav className="space-y-1">
            {files.map(folder => (
              <div key={folder.id} className="space-y-1">
                <div className="flex items-center text-cyan-300 bg-black px-2.5 py-1.5 rounded-none border-2 border-neutral-700 font-mono text-xs font-bold">
                  <Folder className="w-4 h-4 mr-2 text-cyan-400 shrink-0" />
                  <span className="font-bold truncate">{folder.name}</span>
                </div>

                {folder.children && (
                  <div className="pl-3 space-y-0.5 border-l-2 border-neutral-800 ml-3 mt-1">
                    {folder.children.map(file => {
                      const isSelected = file.id === selectedFileId;
                      return (
                        <button
                          key={file.id}
                          onClick={() => onSelectFile(file)}
                          className={`w-full flex items-center px-2 py-1.5 rounded-none text-xs transition-all text-left border ${
                            isSelected
                              ? 'bg-neutral-900 text-cyan-300 font-bold border-cyan-400'
                              : 'text-neutral-300 border-transparent hover:text-white hover:bg-neutral-900 hover:border-neutral-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 mr-2 text-cyan-400 shrink-0" />
                          <span className="truncate font-mono text-[11px]">{file.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Saved Sessions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">Saved Sessions</span>
            <button
              onClick={onNewSession}
              className="p-1 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-none border border-neutral-700 transition-colors"
              title="New Cloudant Session"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          </div>

          <div className="space-y-2">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s)}
                className="w-full flex items-center justify-between p-2 rounded-none bg-black hover:bg-neutral-900 border-2 border-neutral-800 hover:border-cyan-400 transition-all text-left group active:scale-98"
              >
                <div className="truncate pr-2">
                  <div className="text-xs text-neutral-200 group-hover:text-cyan-300 font-bold truncate">
                    {s.name}
                  </div>
                  <div className="text-[9px] text-neutral-400 font-mono">
                    {s.commandCount} queries &bull; {s.encryptedHash.slice(0, 8)}...
                  </div>
                </div>
                <span className="text-[9px] text-neutral-400 shrink-0 flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-1 text-cyan-400" />
                  {s.timestamp}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Controls Footer */}
      <div className="p-4 border-t-2 border-neutral-800 space-y-2 bg-black">
        <button
          onClick={onExportPDF}
          className="w-full flex items-center justify-center space-x-2 py-2 bg-cyan-400 border-2 border-cyan-300 text-black hover:bg-cyan-300 rounded-none text-xs font-extrabold uppercase transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT PDF REPORT</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportMarkdown}
            className="flex items-center justify-center space-x-1.5 py-1.5 bg-black border-2 border-neutral-700 text-white rounded-none text-[11px] font-bold hover:bg-neutral-900 transition-all cursor-pointer active:scale-95"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-300" />
            <span>MARKDOWN</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center justify-center space-x-1.5 py-1.5 bg-black border-2 border-neutral-700 text-white rounded-none text-[11px] font-bold hover:bg-neutral-900 transition-all cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-300" />
            <span>CSV LOG</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

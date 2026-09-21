import React, { useState, useEffect } from 'react';
import { X, Save, FileCode, Check } from 'lucide-react';
import { ProjectFile } from '../types/shell';
import { renderCodeSnippet } from '../utils/syntaxHighlighting';

interface FileViewerModalProps {
  file: ProjectFile | null;
  onClose: () => void;
  onSaveFile: (fileId: string, newContent: string) => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  onClose,
  onSaveFile
}) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (file && file.content) {
      setContent(file.content);
      setIsEditing(false);
      setSavedSuccess(false);
    }
  }, [file]);

  if (!file) return null;

  const handleSave = () => {
    onSaveFile(file.id, content);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#11131A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E293B] bg-[#0D1017]">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">{file.name}</span>
            <span className="text-slate-500">({file.path})</span>
          </div>

          <div className="flex items-center space-x-2">
            {savedSuccess && (
              <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-200 font-mono transition-colors"
            >
              {isEditing ? 'View Syntax Mode' : 'Edit Mode'}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs rounded text-white font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0A0E14] font-mono text-xs">
          {isEditing ? (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-80 bg-[#111622] text-slate-200 p-3 rounded border border-slate-800 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
              spellCheck={false}
            />
          ) : (
            renderCodeSnippet(content, file.language || 'javascript')
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0D1017] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium transition-colors"
          >
            Close File
          </button>
        </div>
      </div>
    </div>
  );
};

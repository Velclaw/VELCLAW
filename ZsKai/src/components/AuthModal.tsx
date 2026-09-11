import React, { useState } from 'react';
import { X, ShieldCheck, Github, Lock, Key, CheckCircle, Smartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types/shell';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [repoName, setRepoName] = useState(user.repoConnected || 'watson-cloudant-etl');
  const [tokenInput, setTokenInput] = useState('ghp_watson_931849a029f2109');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleToggle2FA = () => {
    const nextState = !user.is2FAEnabled;
    onUpdateUser({ is2FAEnabled: nextState });
    setSuccessMessage(nextState ? '2FA Authentication enabled successfully!' : '2FA disabled.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSaveRepo = (provider: 'github' | 'gitlab') => {
    onUpdateUser({
      authProvider: provider,
      repoConnected: repoName
    });
    setSuccessMessage(`Connected repository via ${provider.toUpperCase()}: ${repoName}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-black border-2 border-neutral-700 rounded-none shadow-2xl overflow-hidden text-white font-mono">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-neutral-800 bg-black">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xs font-extrabold text-white uppercase tracking-tight">Security & Repository Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded-none text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {successMessage && (
            <div className="p-3 bg-black border-2 border-cyan-400 rounded-none text-xs text-cyan-300 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* User Profile Card */}
          <div className="p-3 bg-black rounded-none border-2 border-neutral-700 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-none bg-cyan-400 flex items-center justify-center font-extrabold text-black text-sm">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{user.username}</div>
              <div className="text-xs text-neutral-400 font-mono">{user.role} &bull; {user.authProvider.toUpperCase()}</div>
            </div>
          </div>

          {/* 2FA Security Toggle */}
          <div className="space-y-3 pt-2 border-t-2 border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Two-Factor Authentication (2FA)
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Requires Time-based One-Time Password (TOTP) on login.
                </div>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`px-3 py-1.5 rounded-none text-xs font-bold font-mono transition-all cursor-pointer border-2 active:scale-95 ${
                  user.is2FAEnabled
                    ? 'bg-cyan-400 text-black border-cyan-300'
                    : 'bg-black text-neutral-300 border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                {user.is2FAEnabled ? 'ENABLED' : 'ENABLE'}
              </button>
            </div>
          </div>

          {/* Repository Integration */}
          <div className="space-y-3 pt-2 border-t-2 border-neutral-800">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Github className="w-4 h-4 text-cyan-400" />
              GitHub / GitLab Sync Integration
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  className="w-full p-2 bg-black border-2 border-neutral-700 rounded-none text-white font-bold focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Personal Access Token</label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  className="w-full p-2 bg-black border-2 border-neutral-700 rounded-none text-white font-bold focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleSaveRepo('github')}
                  className="py-2 px-3 bg-cyan-400 text-black hover:bg-cyan-300 rounded-none text-xs font-extrabold uppercase border-2 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5 fill-black" />
                  <span>Sync GitHub</span>
                </button>
                <button
                  onClick={() => handleSaveRepo('gitlab')}
                  className="py-2 px-3 bg-black text-cyan-300 hover:bg-neutral-900 rounded-none text-xs font-extrabold uppercase border-2 border-neutral-700 hover:border-cyan-400 shadow-none transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sync GitLab</span>
                </button>
              </div>
            </div>
          </div>

          {/* Encryption Note */}
          <div className="p-3 bg-black rounded-none border-2 border-neutral-800 text-[10px] text-neutral-400 font-mono space-y-1">
            <div className="text-cyan-300 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              End-to-End Cloudant Sync Encryption
            </div>
            <div>All Cloudant sessions and command logs are encrypted using AES-256-GCM before transport.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-neutral-800 bg-black text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black hover:bg-neutral-900 border-2 border-neutral-700 hover:border-cyan-400 text-cyan-300 text-xs rounded-none font-bold uppercase transition-all cursor-pointer active:scale-95"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

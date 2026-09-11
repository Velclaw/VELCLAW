import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  X,
  LogOut,
  Users,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Plus,
  Radio,
  Terminal
} from 'lucide-react';
import {
  initGoogleAuth,
  signInWithGoogle,
  googleSignOut,
  getGoogleAccessToken
} from '../utils/googleAuth';
import { User } from 'firebase/auth';

export interface ChatSpace {
  name: string; // e.g. "spaces/AAAA..."
  displayName?: string;
  type?: string;
  singleUserBotDm?: boolean;
}

export interface ChatMessage {
  name: string;
  sender?: {
    name?: string;
    displayName?: string;
    type?: string;
  };
  text?: string;
  createTime?: string;
}

interface GoogleChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  terminalHistoryText?: string;
}

export const GoogleChatDrawer: React.FC<GoogleChatDrawerProps> = ({
  isOpen,
  onClose,
  terminalHistoryText = ''
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpaceName, setSelectedSpaceName] = useState<string | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auth setup
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authedUser, accessToken) => {
        setUser(authedUser);
        setToken(accessToken);
        setIsAuthChecking(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthChecking(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load spaces when drawer opens or token available
  useEffect(() => {
    if (isOpen && token) {
      handleFetchSpaces();
    }
  }, [isOpen, token]);

  // Load messages when space is selected
  useEffect(() => {
    if (selectedSpaceName && token) {
      handleFetchMessages(selectedSpaceName);
    } else {
      setMessages([]);
    }
  }, [selectedSpaceName, token]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await signInWithPopupGoogle();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ type: 'success', text: 'Đã kết nối Google Chat thành công!' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Không thể đăng nhập Google' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithPopupGoogle = async () => {
    return await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setSpaces([]);
    setSelectedSpaceName(null);
    setMessages([]);
    setStatusMessage({ type: 'info', text: 'Đã đăng xuất Google Chat.' });
  };

  const handleFetchSpaces = async () => {
    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsLoadingSpaces(true);
    setStatusMessage(null);
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=30', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Failed to fetch spaces (${response.status})`);
      }

      const data = await response.json();
      const loadedSpaces: ChatSpace[] = data.spaces || [];
      setSpaces(loadedSpaces);

      if (loadedSpaces.length > 0 && !selectedSpaceName) {
        setSelectedSpaceName(loadedSpaces[0].name);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Không thể tải Google Chat Spaces' });
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const handleFetchMessages = async (spaceName: string) => {
    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsLoadingMessages(true);
    try {
      const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=25&orderBy=createTime%20desc`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Failed to fetch messages (${response.status})`);
      }

      const data = await response.json();
      const loadedMessages: ChatMessage[] = (data.messages || []).reverse();
      setMessages(loadedMessages);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi khi tải tin nhắn' });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || newMessageText;
    if (!content.trim() || !selectedSpaceName) return;

    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsSendingMessage(true);
    setStatusMessage(null);
    try {
      const response = await fetch(`https://chat.googleapis.com/v1/${selectedSpaceName}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: content.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Failed to post message (${response.status})`);
      }

      setNewMessageText('');
      setStatusMessage({ type: 'success', text: 'Đã gửi tin nhắn thành công!' });
      await handleFetchMessages(selectedSpaceName);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Không thể gửi tin nhắn' });
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-xl bg-black border-l-2 border-neutral-800 h-full flex flex-col shadow-2xl text-white">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-neutral-800 bg-black">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Google Chat Live
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-cyan-400 text-black font-extrabold uppercase border border-cyan-300">
              Workspace Chat API
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={handleSignOut}
                className="px-2 py-1 bg-black text-neutral-400 hover:text-white border-2 border-neutral-800 hover:border-neutral-600 text-xs font-bold uppercase cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 inline mr-1" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 bg-black hover:bg-neutral-900 border-2 border-neutral-700 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                : statusMessage.type === 'error'
                ? 'bg-red-950/80 text-red-300 border-red-700'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
              {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        {isAuthChecking ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-neutral-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <p className="text-xs font-bold uppercase tracking-wider">Đang kiểm tra kết nối Google Chat...</p>
          </div>
        ) : !user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="p-4 bg-black border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] max-w-md space-y-3">
              <MessageSquare className="w-10 h-10 text-cyan-400 mx-auto" />
              <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
                Kết Nối Google Chat Spaces
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Đăng nhập tài khoản Google Workspace để gửi thông báo terminal, cảnh báo sự cố từ ứng dụng trực tiếp tới Google Chat Spaces / Direct Messages.
              </p>
            </div>

            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-800 font-bold border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all cursor-pointer active:scale-95 flex items-center space-x-3 uppercase text-xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isSigningIn ? 'Đang xác thực...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Spaces Selector & Refresh */}
            <div className="p-3 bg-neutral-950 border-b-2 border-neutral-800 flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                  Chọn Google Chat Space
                </label>
                <select
                  value={selectedSpaceName || ''}
                  onChange={e => setSelectedSpaceName(e.target.value)}
                  className="w-full bg-black text-cyan-300 text-xs font-extrabold uppercase border-2 border-neutral-700 p-1.5 focus:border-cyan-400 focus:outline-none"
                >
                  {spaces.length === 0 ? (
                    <option value="">-- Không có Space nào --</option>
                  ) : (
                    spaces.map(sp => (
                      <option key={sp.name} value={sp.name}>
                        {sp.displayName || sp.name} {sp.type ? `(${sp.type})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                onClick={handleFetchSpaces}
                disabled={isLoadingSpaces}
                className="p-2 mt-4 bg-black border-2 border-neutral-700 hover:border-cyan-400 text-cyan-300 cursor-pointer shrink-0"
                title="Tải lại danh sách Space"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
              {isLoadingMessages ? (
                <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                  <p>Đang tải tin nhắn từ Google Chat Space...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 font-bold uppercase">
                  Chưa có tin nhắn trong Space này hoặc không thể tải được.
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.name || idx} className="p-3 bg-neutral-950 border-2 border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-cyan-400 uppercase">
                        {msg.sender?.displayName || 'Thành viên Chat'}
                      </span>
                      <span className="text-neutral-500">
                        {msg.createTime ? new Date(msg.createTime).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-white leading-relaxed font-sans whitespace-pre-wrap selection:bg-cyan-400 selection:text-black">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Quick Send Terminal Output Option */}
            {terminalHistoryText && selectedSpaceName && (
              <div className="px-3 py-2 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-bold uppercase truncate">
                  Terminal Output khả dụng ({terminalHistoryText.length} chars)
                </span>
                <button
                  onClick={() => handleSendMessage(`[WATSON TERMINAL LOG]\n${terminalHistoryText}`)}
                  disabled={isSendingMessage}
                  className="px-2.5 py-1 bg-black border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black font-extrabold text-[10px] uppercase transition-all cursor-pointer shrink-0"
                >
                  <Terminal className="w-3 h-3 inline mr-1" />
                  Báo Cáo Terminal Sang Chat
                </button>
              </div>
            )}

            {/* Message Input Composer */}
            <div className="p-3 bg-neutral-950 border-t-2 border-neutral-800">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn gửi sang Google Chat Space..."
                  value={newMessageText}
                  onChange={e => setNewMessageText(e.target.value)}
                  disabled={!selectedSpaceName || isSendingMessage}
                  className="flex-1 bg-black text-white text-xs font-bold p-2 border-2 border-neutral-700 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || !selectedSpaceName || isSendingMessage}
                  className="px-4 py-2 bg-cyan-400 text-black font-extrabold text-xs uppercase border-2 border-cyan-300 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Gửi</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

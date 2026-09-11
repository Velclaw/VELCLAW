import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  X,
  LogOut,
  Send,
  AlertTriangle,
  CheckCircle,
  Copy,
  Lock,
  Sparkles,
  FilePlus,
  BookOpen
} from 'lucide-react';
import {
  initGoogleAuth,
  signInWithGoogle,
  googleSignOut,
  getGoogleAccessToken
} from '../utils/googleAuth';
import {
  listGoogleDocs,
  getGoogleDoc,
  createGoogleDoc,
  insertTextToGoogleDoc,
  extractPlainTextFromGoogleDoc,
  GoogleDocFile,
  GoogleDocDetail
} from '../utils/googleDocsService';
import { User } from 'firebase/auth';

interface GoogleDocsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  terminalHistoryText?: string;
}

export const GoogleDocsDrawer: React.FC<GoogleDocsDrawerProps> = ({
  isOpen,
  onClose,
  terminalHistoryText = ''
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [docsList, setDocsList] = useState<GoogleDocFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [activeDocDetail, setActiveDocDetail] = useState<GoogleDocDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // New Doc Form
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isSubmittingNewDoc, setIsSubmittingNewDoc] = useState(false);

  // Append Text / Append Terminal History State & Confirmation Modal
  const [appendInputText, setAppendInputText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [textToConfirmAppend, setTextToConfirmAppend] = useState('');
  const [isAppendingText, setIsAppendingText] = useState(false);

  // Notifications / Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auth Listener
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

  // Fetch docs when drawer opens or token is available
  useEffect(() => {
    if (isOpen && token) {
      handleFetchDocs();
    }
  }, [isOpen, token]);

  // Fetch selected doc detail
  useEffect(() => {
    if (selectedDocId && token) {
      handleLoadDocDetail(selectedDocId);
    } else {
      setActiveDocDetail(null);
    }
  }, [selectedDocId, token]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ type: 'success', text: 'Đăng nhập Google thành công!' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi đăng nhập Google Docs' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setDocsList([]);
    setSelectedDocId(null);
    setActiveDocDetail(null);
    setStatusMessage({ type: 'info', text: 'Đã đăng xuất Google.' });
  };

  const handleFetchDocs = async () => {
    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsLoadingDocs(true);
    setStatusMessage(null);
    try {
      const docs = await listGoogleDocs(activeToken, searchQuery);
      setDocsList(docs);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Không thể tải danh sách Google Docs' });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleLoadDocDetail = async (docId: string) => {
    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsLoadingDetail(true);
    try {
      const detail = await getGoogleDoc(activeToken, docId);
      setActiveDocDetail(detail);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Không thể tải nội dung tài liệu' });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreateNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsSubmittingNewDoc(true);
    setStatusMessage(null);
    try {
      const created = await createGoogleDoc(activeToken, newDocTitle.trim());
      setNewDocTitle('');
      setIsCreatingDoc(false);
      setStatusMessage({ type: 'success', text: `Tạo tài liệu "${created.title}" thành công!` });
      await handleFetchDocs();
      setSelectedDocId(created.documentId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi khi tạo Google Doc' });
    } finally {
      setIsSubmittingNewDoc(false);
    }
  };

  const triggerAppendConfirmation = (textToAppend: string) => {
    if (!textToAppend.trim()) return;
    setTextToConfirmAppend(textToAppend);
    setShowConfirmModal(true);
  };

  const handleConfirmedAppend = async () => {
    if (!selectedDocId || !textToConfirmAppend.trim()) return;

    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsAppendingText(true);
    setStatusMessage(null);
    try {
      await insertTextToGoogleDoc(activeToken, selectedDocId, textToConfirmAppend.trim());
      setStatusMessage({ type: 'success', text: 'Đã cập nhật nội dung vào Google Doc thành công!' });
      setShowConfirmModal(false);
      setAppendInputText('');
      setTextToConfirmAppend('');
      // Reload document detail
      await handleLoadDocDetail(selectedDocId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi khi ghi vào Google Doc' });
    } finally {
      setIsAppendingText(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-2xl bg-black border-l-2 border-neutral-800 h-full flex flex-col shadow-2xl text-white">
        
        {/* Drawer Top Bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-neutral-800 bg-black">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Google Docs Manager
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-cyan-400 text-black font-extrabold uppercase border border-cyan-300">
              Workspace API
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={handleSignOut}
                className="px-2 py-1 bg-black text-neutral-400 hover:text-white border-2 border-neutral-800 hover:border-neutral-600 rounded-none text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                title="Đăng xuất khỏi Google"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 bg-black hover:bg-neutral-900 border-2 border-neutral-700 text-neutral-400 hover:text-white rounded-none transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Account Bar if authenticated */}
        {user && (
          <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center space-x-2 truncate">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-none border border-cyan-400" />
              ) : (
                <div className="w-5 h-5 bg-cyan-400 text-black font-bold flex items-center justify-center text-[10px]">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <span className="truncate font-bold text-white">{user.displayName || user.email}</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-bold bg-black px-2 py-0.5 border border-neutral-800 uppercase">
              Google Verified
            </span>
          </div>
        )}

        {/* Status Toast / Alert Banner */}
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
            <p className="text-xs font-bold uppercase tracking-wider">Đang kiểm tra xác thực Google...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated State - Sign In with Google Button */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="p-4 bg-black border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] max-w-md space-y-3">
              <FileText className="w-10 h-10 text-cyan-400 mx-auto" />
              <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
                Kết Nối Google Docs Workspace
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Đăng nhập tài khoản Google để trực tiếp xem, tìm kiếm, tạo mới và đồng bộ dữ liệu nhật ký terminal / ghi chú Watson AI vào Google Docs của bạn.
              </p>
            </div>

            {/* Standard Official Sign In with Google Button */}
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-800 font-bold border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all cursor-pointer active:scale-95 flex items-center space-x-3 rounded-none uppercase text-xs"
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
          /* Authenticated Workspace View */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Column: Documents List & Search */}
            <div className="w-full md:w-5/12 border-b-2 md:border-b-0 md:border-r-2 border-neutral-800 flex flex-col bg-black">
              
              {/* Search & Action Controls */}
              <div className="p-3 border-b-2 border-neutral-800 space-y-2 bg-neutral-950">
                <div className="flex items-center space-x-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm Google Doc..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleFetchDocs()}
                      className="w-full pl-8 pr-2 py-1.5 bg-black border-2 border-neutral-700 focus:border-cyan-400 text-white text-xs rounded-none focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    onClick={handleFetchDocs}
                    disabled={isLoadingDocs}
                    className="p-1.5 bg-black hover:bg-neutral-900 border-2 border-neutral-700 hover:border-cyan-400 text-cyan-300 rounded-none cursor-pointer"
                    title="Tải lại danh sách"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Create New Doc Button */}
                <button
                  onClick={() => setIsCreatingDoc(!isCreatingDoc)}
                  className="w-full py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase border-2 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tạo Google Doc Mới</span>
                </button>

                {/* Inline New Doc Form */}
                {isCreatingDoc && (
                  <form onSubmit={handleCreateNewDoc} className="p-2 bg-black border-2 border-cyan-400 space-y-2">
                    <label className="text-[10px] text-neutral-300 uppercase font-extrabold block">Tên Tài Liệu Mới</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Watson_ETL_Report_2026"
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      required
                      className="w-full p-1.5 bg-neutral-900 border-2 border-neutral-700 text-white text-xs rounded-none focus:border-cyan-400 focus:outline-none"
                    />
                    <div className="flex space-x-2 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingNewDoc || !newDocTitle.trim()}
                        className="flex-1 py-1 bg-cyan-400 text-black font-extrabold text-xs uppercase border border-cyan-300 hover:bg-cyan-300 cursor-pointer"
                      >
                        {isSubmittingNewDoc ? 'Đang tạo...' : 'Xác nhận tạo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingDoc(false)}
                        className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs font-bold uppercase border border-neutral-700 hover:bg-neutral-700 cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* List of Files */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoadingDocs ? (
                  <div className="p-6 text-center text-xs text-neutral-400 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                    <p>Đang quét Google Drive...</p>
                  </div>
                ) : docsList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 font-bold uppercase">
                    Không tìm thấy tài liệu Google Docs nào.
                  </div>
                ) : (
                  docsList.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-2.5 border-2 transition-all cursor-pointer flex items-start space-x-2.5 rounded-none ${
                        selectedDocId === doc.id
                          ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                          : 'bg-black border-neutral-800 hover:border-neutral-600 text-neutral-300'
                      }`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${selectedDocId === doc.id ? 'text-cyan-400' : 'text-neutral-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate leading-tight">{doc.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between">
                          <span>{doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString() : 'N/A'}</span>
                          {doc.webViewLink && (
                            <a
                              href={doc.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-cyan-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Mở</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Selected Document Content & Actions */}
            <div className="flex-1 flex flex-col bg-black overflow-hidden">
              {selectedDocId ? (
                <>
                  {/* Selected Doc Top Bar */}
                  <div className="p-3 border-b-2 border-neutral-800 bg-neutral-950 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] uppercase font-extrabold text-cyan-400 block">Đang xem document</span>
                      <h3 className="font-extrabold text-xs text-white truncate">
                        {activeDocDetail?.title || 'Đang tải...'}
                      </h3>
                    </div>
                    {activeDocDetail && (
                      <a
                        href={`https://docs.google.com/document/d/${selectedDocId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-black border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black font-extrabold text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>Mở trên Google Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Document Text Preview */}
                  <div className="flex-1 overflow-y-auto p-4 bg-black text-xs font-sans space-y-3 leading-relaxed text-neutral-200">
                    {isLoadingDetail ? (
                      <div className="py-12 text-center text-neutral-400 space-y-2 font-mono">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                        <p>Đang đọc nội dung từ Google Docs API...</p>
                      </div>
                    ) : activeDocDetail ? (
                      <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-none font-mono text-[11px] whitespace-pre-wrap selection:bg-cyan-400 selection:text-black">
                        {extractPlainTextFromGoogleDoc(activeDocDetail) || (
                          <span className="text-neutral-500 italic">[Tài liệu trống]</span>
                        )}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-neutral-500 font-mono">Không có dữ liệu.</div>
                    )}
                  </div>

                  {/* Quick Export / Append Terminal Logs Section */}
                  <div className="p-3 border-t-2 border-neutral-800 bg-neutral-950 space-y-2">
                    <div className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Thêm dữ liệu vào tài liệu này
                    </div>

                    {/* Quick Button to append terminal history if present */}
                    {terminalHistoryText && (
                      <button
                        onClick={() => triggerAppendConfirmation(terminalHistoryText)}
                        className="w-full py-1 px-2 bg-black border-2 border-neutral-700 hover:border-cyan-400 text-cyan-300 font-bold text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Chèn Nhật Ký Terminal Hiện Tại</span>
                      </button>
                    )}

                    {/* Manual Append Text Input */}
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        placeholder="Nhập ghi chú cần chèn vào Google Doc..."
                        value={appendInputText}
                        onChange={e => setAppendInputText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && appendInputText.trim()) {
                            triggerAppendConfirmation(appendInputText);
                          }
                        }}
                        className="flex-1 p-1.5 bg-black border-2 border-neutral-700 focus:border-cyan-400 text-white text-xs rounded-none focus:outline-none font-mono"
                      />
                      <button
                        onClick={() => triggerAppendConfirmation(appendInputText)}
                        disabled={!appendInputText.trim()}
                        className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase border-2 border-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3 h-3 stroke-[3]" />
                        <span>Ghi</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-neutral-500 text-xs font-bold uppercase text-center space-y-2">
                  <FileText className="w-8 h-8 text-neutral-700" />
                  <p>Vui lòng chọn một tài liệu bên trái để xem và cập nhật</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* User Confirmation Dialog for Destructive/Mutating Document Updates */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
            <div className="bg-black border-2 border-cyan-400 p-5 max-w-md w-full space-y-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <div className="flex items-center space-x-2 text-cyan-400">
                <AlertTriangle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm uppercase text-white">
                  Xác Nhận Cập Nhật Google Doc
                </h3>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Thao tác này sẽ gửi lệnh trực tiếp qua Google Docs API để chèn đoạn nội dung sau vào tài liệu{' '}
                <strong className="text-cyan-300 font-mono">{activeDocDetail?.title}</strong>:
              </p>

              <div className="p-2.5 bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-cyan-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {textToConfirmAppend}
              </div>

              <div className="flex space-x-3 pt-2 font-mono">
                <button
                  onClick={handleConfirmedAppend}
                  disabled={isAppendingText}
                  className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase border-2 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)] cursor-pointer transition-all active:scale-95"
                >
                  {isAppendingText ? 'Đang cập nhật...' : 'Đồng Ý Cập Nhật'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isAppendingText}
                  className="px-4 py-2 bg-black hover:bg-neutral-900 text-neutral-300 border-2 border-neutral-700 text-xs font-bold uppercase cursor-pointer"
                >
                  Hủy Thao Tác
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

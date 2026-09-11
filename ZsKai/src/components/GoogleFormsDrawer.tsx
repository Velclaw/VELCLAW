import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  X,
  ExternalLink,
  Search,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Users,
  Eye,
  Send,
  Sparkles
} from 'lucide-react';
import {
  initGoogleAuth,
  signInWithGoogle,
  googleSignOut,
  getGoogleAccessToken
} from '../utils/googleAuth';
import { User } from 'firebase/auth';

export interface GoogleFormFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface GoogleFormDetail {
  formId: string;
  info?: {
    title?: string;
    description?: string;
    documentTitle?: string;
  };
  items?: {
    itemId?: string;
    title?: string;
    description?: string;
    questionItem?: {
      question?: {
        questionId?: string;
        required?: boolean;
      };
    };
  }[];
  responderUri?: string;
}

export interface GoogleFormResponse {
  responseId: string;
  createTime?: string;
  answers?: Record<string, any>;
}

interface GoogleFormsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleFormsDrawer: React.FC<GoogleFormsDrawerProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [formsList, setFormsList] = useState<GoogleFormFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingForms, setIsLoadingForms] = useState(false);

  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [activeFormDetail, setActiveFormDetail] = useState<GoogleFormDetail | null>(null);
  const [activeFormResponses, setActiveFormResponses] = useState<GoogleFormResponse[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // New Form Creation state
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [isSubmittingNewForm, setIsSubmittingNewForm] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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

  useEffect(() => {
    if (isOpen && token) {
      handleFetchForms();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (selectedFormId && token) {
      handleLoadFormDetails(selectedFormId);
    } else {
      setActiveFormDetail(null);
      setActiveFormResponses([]);
    }
  }, [selectedFormId, token]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ type: 'success', text: 'Đã kết nối Google Forms thành công!' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Không thể xác thực Google Forms' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setFormsList([]);
    setSelectedFormId(null);
    setActiveFormDetail(null);
    setActiveFormResponses([]);
    setStatusMessage({ type: 'info', text: 'Đã đăng xuất Google Forms.' });
  };

  const handleFetchForms = async () => {
    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsLoadingForms(true);
    setStatusMessage(null);
    try {
      let q = "mimeType='application/vnd.google-apps.form' and trashed=false";
      if (searchQuery.trim()) {
        q += ` and name contains '${searchQuery.trim().replace(/'/g, "\\'")}'`;
      }

      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=modifiedTime%20desc&pageSize=20&fields=files(id,name,modifiedTime,webViewLink)`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Failed to fetch forms (${response.status})`);
      }

      const data = await response.json();
      setFormsList(data.files || []);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Không thể tải danh sách Google Forms' });
    } finally {
      setIsLoadingForms(false);
    }
  };

  const handleLoadFormDetails = async (formId: string) => {
    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsLoadingDetail(true);
    try {
      // Fetch Form Metadata
      const formRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (!formRes.ok) {
        const errData = await formRes.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Failed to get form detail (${formRes.status})`);
      }

      const formDetail: GoogleFormDetail = await formRes.json();
      setActiveFormDetail(formDetail);

      // Fetch Form Responses
      const respRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (respRes.ok) {
        const respData = await respRes.json();
        setActiveFormResponses(respData.responses || []);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi khi đọc thông tin biểu mẫu' });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreateNewForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    const activeToken = token || getGoogleAccessToken();
    if (!activeToken) return;

    setIsSubmittingNewForm(true);
    setStatusMessage(null);
    try {
      const response = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: newFormTitle.trim(),
            documentTitle: newFormTitle.trim()
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Failed to create Google Form (${response.status})`);
      }

      const createdForm: GoogleFormDetail = await response.json();
      setNewFormTitle('');
      setIsCreatingForm(false);
      setStatusMessage({ type: 'success', text: `Tạo Google Form "${createdForm.info?.title}" thành công!` });
      await handleFetchForms();
      setSelectedFormId(createdForm.formId);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi khi tạo Google Form' });
    } finally {
      setIsSubmittingNewForm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm select-none font-mono">
      <div className="w-full max-w-2xl bg-black border-l-2 border-neutral-800 h-full flex flex-col shadow-2xl text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-neutral-800 bg-black">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Google Forms Manager
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-cyan-400 text-black font-extrabold uppercase border border-cyan-300">
              Workspace Forms API
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={handleSignOut}
                className="px-2 py-1 bg-black text-neutral-400 hover:text-white border-2 border-neutral-800 hover:border-neutral-600 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 bg-black hover:bg-neutral-900 border-2 border-neutral-700 text-neutral-400 hover:text-white rounded-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
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

        {/* Content View */}
        {isAuthChecking ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-neutral-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <p className="text-xs font-bold uppercase tracking-wider">Đang kiểm tra quyền Google Forms...</p>
          </div>
        ) : !user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="p-4 bg-black border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] max-w-md space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-cyan-400 mx-auto" />
              <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
                Kết Nối Google Forms API
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Đăng nhập tài khoản Google để tạo biểu mẫu khảo sát mới, xem câu hỏi và kiểm tra câu trả lời (responses) trực tiếp từ Google Forms.
              </p>
            </div>

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
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Column: Forms List & Search */}
            <div className="w-full md:w-5/12 border-b-2 md:border-b-0 md:border-r-2 border-neutral-800 flex flex-col bg-black">
              
              <div className="p-3 border-b-2 border-neutral-800 space-y-2 bg-neutral-950">
                <div className="flex items-center space-x-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm Google Form..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleFetchForms()}
                      className="w-full pl-8 pr-2 py-1.5 bg-black border-2 border-neutral-700 focus:border-cyan-400 text-white text-xs rounded-none focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    onClick={handleFetchForms}
                    disabled={isLoadingForms}
                    className="p-1.5 bg-black border-2 border-neutral-700 hover:border-cyan-400 text-cyan-300 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingForms ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => setIsCreatingForm(!isCreatingForm)}
                  className="w-full py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase border-2 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tạo Google Form Mới</span>
                </button>

                {isCreatingForm && (
                  <form onSubmit={handleCreateNewForm} className="p-2 bg-black border-2 border-cyan-400 space-y-2">
                    <label className="text-[10px] text-neutral-300 uppercase font-extrabold block">
                      Tiêu Đề Biểu Mẫu Khảo Sát
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Dev_Feedback_Survey_2026"
                      value={newFormTitle}
                      onChange={e => setNewFormTitle(e.target.value)}
                      required
                      className="w-full p-1.5 bg-neutral-900 border-2 border-neutral-700 text-white text-xs rounded-none focus:border-cyan-400 focus:outline-none"
                    />
                    <div className="flex space-x-2 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingNewForm || !newFormTitle.trim()}
                        className="flex-1 py-1 bg-cyan-400 text-black font-extrabold text-xs uppercase border border-cyan-300 hover:bg-cyan-300 cursor-pointer"
                      >
                        {isSubmittingNewForm ? 'Đang tạo...' : 'Xác nhận tạo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingForm(false)}
                        className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs font-bold uppercase border border-neutral-700 cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Forms File List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoadingForms ? (
                  <div className="p-6 text-center text-xs text-neutral-400 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                    <p>Đang quét Google Drive...</p>
                  </div>
                ) : formsList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 font-bold uppercase">
                    Không tìm thấy Google Form nào.
                  </div>
                ) : (
                  formsList.map(form => (
                    <div
                      key={form.id}
                      onClick={() => setSelectedFormId(form.id)}
                      className={`p-2.5 border-2 transition-all cursor-pointer flex items-start space-x-2.5 ${
                        selectedFormId === form.id
                          ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                          : 'bg-black border-neutral-800 hover:border-neutral-600 text-neutral-300'
                      }`}
                    >
                      <FileSpreadsheet className={`w-4 h-4 shrink-0 mt-0.5 ${selectedFormId === form.id ? 'text-cyan-400' : 'text-neutral-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate leading-tight">{form.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between">
                          <span>{form.modifiedTime ? new Date(form.modifiedTime).toLocaleDateString() : 'N/A'}</span>
                          {form.webViewLink && (
                            <a
                              href={form.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-cyan-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Chỉnh sửa</span>
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

            {/* Right Column: Selected Form Details & Responses */}
            <div className="flex-1 flex flex-col bg-black overflow-hidden">
              {selectedFormId ? (
                <>
                  <div className="p-3 border-b-2 border-neutral-800 bg-neutral-950 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] uppercase font-extrabold text-cyan-400 block">Đang chọn Form</span>
                      <h3 className="font-extrabold text-xs text-white truncate">
                        {activeFormDetail?.info?.title || 'Đang tải...'}
                      </h3>
                    </div>
                    {activeFormDetail?.responderUri && (
                      <a
                        href={activeFormDetail.responderUri}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-cyan-400 text-black hover:bg-cyan-300 font-extrabold text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>Mở Link Trả Lời</span>
                        <ExternalLink className="w-3 h-3 text-black stroke-[3]" />
                      </a>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoadingDetail ? (
                      <div className="py-12 text-center text-neutral-400 space-y-2 font-mono">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                        <p>Đang tải thông tin biểu mẫu và danh sách phản hồi...</p>
                      </div>
                    ) : (
                      <>
                        {/* Form Questions Overview */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-extrabold uppercase text-cyan-400 border-b border-neutral-800 pb-1">
                            Danh Sách Câu Hỏi ({activeFormDetail?.items?.length || 0})
                          </h4>
                          {activeFormDetail?.items && activeFormDetail.items.length > 0 ? (
                            <div className="space-y-1.5">
                              {activeFormDetail.items.map((item, idx) => (
                                <div key={item.itemId || idx} className="p-2.5 bg-neutral-950 border border-neutral-800 text-xs">
                                  <span className="font-bold text-white block">{idx + 1}. {item.title || '[Chưa đặt tên câu hỏi]'}</span>
                                  {item.description && (
                                    <span className="text-[11px] text-neutral-400 block mt-0.5">{item.description}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-neutral-500 italic p-2 bg-neutral-950 border border-neutral-900">
                              Biểu mẫu này chưa có câu hỏi nào.
                            </div>
                          )}
                        </div>

                        {/* Responses Section */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                            <h4 className="text-xs font-extrabold uppercase text-cyan-400">
                              Phản Hồi Đã Nhận ({activeFormResponses.length})
                            </h4>
                          </div>

                          {activeFormResponses.length > 0 ? (
                            <div className="space-y-2">
                              {activeFormResponses.map((resp, idx) => (
                                <div key={resp.responseId || idx} className="p-3 bg-neutral-950 border border-neutral-800 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                                    <span className="font-bold text-cyan-300"># Response {idx + 1}</span>
                                    <span>{resp.createTime ? new Date(resp.createTime).toLocaleString() : ''}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-neutral-500 italic p-3 bg-neutral-950 border border-neutral-900 text-center">
                              Chưa có lượt gửi câu trả lời nào cho biểu mẫu này.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-neutral-500 text-xs font-bold uppercase text-center space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-neutral-700" />
                  <p>Chọn một Google Form để xem chi tiết câu hỏi & phản hồi</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

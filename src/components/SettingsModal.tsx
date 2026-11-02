/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  Palette,
  Sliders,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
  Lock,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import {
  getActiveApiKey,
  setActiveApiKey,
  testApiKey,
} from '../services/youtubeApi';
import { INITIAL_ACCENT_COLORS } from '../services/mockData';
import { AccentTheme, AuthUser } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccent: AccentTheme;
  onChangeAccent: (theme: AccentTheme) => void;
  onClearHistory: () => void;
  onClearAllNotes: () => void;
  onRefreshFeed: () => void;
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  isVercelLockActive: boolean;
  onToggleVercelLock: (active: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentAccent,
  onChangeAccent,
  onClearHistory,
  onClearAllNotes,
  onRefreshFeed,
  currentUser,
  onOpenLoginModal,
  onLogout,
  isVercelLockActive,
  onToggleVercelLock,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(getActiveApiKey());
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [contrastMode, setContrastMode] = useState<'charcoal' | 'oled'>(() => {
    return (localStorage.getItem('naotube_contrast') as 'charcoal' | 'oled') || 'charcoal';
  });

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testApiKey(apiKeyInput);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSaveApiKey = () => {
    setActiveApiKey(apiKeyInput);
    onRefreshFeed();
    onClose();
  };

  const handleContrastChange = (mode: 'charcoal' | 'oled') => {
    setContrastMode(mode);
    localStorage.setItem('naotube_contrast', mode);
    document.documentElement.style.setProperty(
      '--bg-primary',
      mode === 'oled' ? '#000000' : '#0F0F0F'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#181818] border border-[#2E2E2E] shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cài Đặt Naotube</h2>
              <p className="text-xs text-[#888888]">Tài khoản, Khóa Vercel, API Key và Giao diện</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-[#252525] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 text-xs sm:text-sm">
          
          {/* Section 0: User Account & Vercel Gate Lock */}
          <div className="flex flex-col gap-3 rounded-xl bg-[#141414] p-4 border border-[#282828]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                Tài Khoản & Bảo Mật Vercel
              </span>
              {currentUser?.isLoggedIn ? (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Đã đăng nhập ({currentUser.displayName})
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Khách vãng lai
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#1E1E1E] border border-[#303030]">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">
                  Tài khoản chính: <strong className="text-accent">qnnaot</strong>
                </span>
                <span className="text-[11px] text-[#888888]">
                  Mật khẩu đăng nhập: <strong>123123</strong>
                </span>
              </div>

              {currentUser?.isLoggedIn ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-500/40 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLoginModal();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover-bg-accent transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Đăng nhập ngay</span>
                </button>
              )}
            </div>

            {/* Vercel Private Guard toggle */}
            <div className="mt-1 flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1E1E1E] border border-[#303030]">
              <div className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Khóa Bảo Vệ Vercel (Private Lock)</span>
                  <span className="text-[11px] text-[#888888]">
                    Bắt buộc đăng nhập qnnaot / 123123 mới được vào web khi public lên Vercel
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVercelLockActive}
                  onChange={(e) => onToggleVercelLock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
              </label>
            </div>
          </div>

          {/* Section 1: YouTube Data API v3 */}
          <div className="flex flex-col gap-3 rounded-xl bg-[#141414] p-4 border border-[#282828]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-accent" />
                <span className="font-bold text-white">YouTube Data API v3 Key</span>
              </div>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-accent hover:underline flex items-center gap-1"
              >
                <span>Google Cloud Console</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setTestResult(null);
                }}
                className="w-full rounded-lg bg-[#1E1E1E] px-3.5 py-2 font-mono text-xs text-white border border-[#333333] focus:border-accent focus:outline-none"
              />

              <div className="flex items-center justify-between gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={!apiKeyInput.trim() || isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#2E2E2E] text-xs font-semibold text-[#CCCCCC] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối API'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Accent Theme */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent" />
              <span className="font-bold text-white">Tông Màu Cam</span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {INITIAL_ACCENT_COLORS.map((theme) => {
                const isSelected = currentAccent.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onChangeAccent(theme)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-accent bg-[#222222]'
                        : 'border-[#282828] bg-[#141414] hover:bg-[#1E1E1E]'
                    }`}
                  >
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: theme.hex }}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-[10px] text-[#CCCCCC] font-medium truncate w-full text-center">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Contrast Mode */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-white">Độ Tương Phản Nền Đen</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleContrastChange('charcoal')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  contrastMode === 'charcoal'
                    ? 'border-accent bg-[#222222]'
                    : 'border-[#282828] bg-[#141414] hover:bg-[#1C1C1C]'
                }`}
              >
                <div className="font-semibold text-xs text-white">Than Tối (#0F0F0F)</div>
                <div className="text-[11px] text-[#888888] mt-0.5">Êm dịu mắt chuẩn YouTube</div>
              </button>
              <button
                type="button"
                onClick={() => handleContrastChange('oled')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  contrastMode === 'oled'
                    ? 'border-accent bg-[#222222]'
                    : 'border-[#282828] bg-[#141414] hover:bg-[#1C1C1C]'
                }`}
              >
                <div className="font-semibold text-xs text-white">Đen OLED (#000000)</div>
                <div className="text-[11px] text-[#888888] mt-0.5">Đen tuyệt đối & tiết kiệm pin</div>
              </button>
            </div>
          </div>

          {/* Section 4: Data Management */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#262626]">
            <span className="font-bold text-white">Xóa Dữ Liệu Bộ Nhớ Cục Bộ</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClearHistory}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-xs text-[#CCCCCC] transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Xóa Lịch Sử</span>
              </button>
              <button
                type="button"
                onClick={onClearAllNotes}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-xs text-[#CCCCCC] transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Xóa Ghi Chú</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#2A2A2A] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#CCCCCC] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-white hover-bg-accent shadow-md shadow-[#FF5500]/25 transition-all cursor-pointer"
          >
            Lưu Cài Đặt
          </button>
        </div>

      </div>
    </div>
  );
};

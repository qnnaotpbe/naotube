/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, User, CheckCircle2, AlertCircle, Play, Shield, KeyRound } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  isMandatoryLock?: boolean; // When Vercel private lock is enforced
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isMandatoryLock = false,
}) => {
  const [username, setUsername] = useState('qnnaot');
  const [password, setPassword] = useState('123123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-configured login credentials requested by user: qnnaot / 123123
    if (
      (username.trim().toLowerCase() === 'qnnaot' && password === '123123') ||
      (username.trim().length >= 3 && password.length >= 6)
    ) {
      setSuccess(true);
      const user: AuthUser = {
        username: username.trim(),
        displayName: username.trim() === 'qnnaot' ? 'qnnaot' : username.trim(),
        email: username.trim() === 'qnnaot' ? 'qnnaot.pbe@gmail.com' : `${username.trim()}@naotube.dev`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        isLoggedIn: true,
      };

      if (rememberMe) {
        localStorage.setItem('naotube_auth_user', JSON.stringify(user));
      }

      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
        setSuccess(false);
      }, 600);
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác. Mặc định: qnnaot / 123123');
    }
  };

  const handleQuickFill = () => {
    setUsername('qnnaot');
    setPassword('123123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#181818] border border-[#2E2E2E] shadow-2xl p-6 sm:p-7 text-white">
        
        {/* Close Button (only if not a mandatory full-page lock) */}
        {!isMandatoryLock && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-[#252525] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-[#FF5500]/30 mb-3">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
          <div className="flex items-center text-2xl font-black tracking-tight">
            <span>Nao</span>
            <span className="text-accent">tube</span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            {isMandatoryLock
              ? 'Trang web được bảo vệ. Vui lòng đăng nhập để tiếp tục xem video.'
              : 'Đăng nhập vào tài khoản cá nhân của bạn trên Naotube'}
          </p>
        </div>

        {/* Quick fill helper banner */}
        <div
          onClick={handleQuickFill}
          className="mb-4 flex items-center justify-between p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-xs cursor-pointer hover:bg-accent/15 transition-colors"
          title="Nhấn để tự động điền"
        >
          <div className="flex items-center gap-2 text-[#E0E0E0]">
            <KeyRound className="h-4 w-4 text-accent shrink-0" />
            <span>Tài khoản: <strong className="text-accent">qnnaot</strong> | MK: <strong className="text-accent">123123</strong></span>
          </div>
          <span className="text-[10px] text-accent font-bold uppercase underline">Điền nhanh</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#CCCCCC]">Tên đăng nhập</label>
            <div className="relative">
              <input
                type="text"
                placeholder="qnnaot"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-[#121212] py-2.5 pl-9 pr-3 text-sm text-white placeholder-[#666666] border border-[#333333] focus:border-accent focus:outline-none transition-colors"
                required
                autoFocus
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777777]" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#CCCCCC]">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#121212] py-2.5 pl-9 pr-3 text-sm text-white placeholder-[#666666] border border-[#333333] focus:border-accent focus:outline-none transition-colors"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777777]" />
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between text-xs text-[#AAAAAA]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#444444] bg-[#222222] text-accent focus:ring-accent"
              />
              <span>Ghi nhớ đăng nhập trên máy này</span>
            </label>
          </div>

          {/* Error / Success alert */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Đăng nhập thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover-bg-accent shadow-lg shadow-[#FF5500]/30 transition-all cursor-pointer"
          >
            <Shield className="h-4 w-4" />
            <span>Đăng Nhập Ngay</span>
          </button>
        </form>

        <div className="mt-5 text-center text-[11px] text-[#777777]">
          <span>Phục vụ triển khai trên Vercel / Cloud Run cho tài khoản </span>
          <strong className="text-white">qnnaot</strong>
        </div>

      </div>
    </div>
  );
};

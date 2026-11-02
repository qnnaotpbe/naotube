/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  Play,
  Bell,
  Upload,
  Settings,
  Palette,
  Check,
  Tv2,
  Plus,
  LogIn,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { ApiStatus } from '../services/youtubeApi';
import { INITIAL_ACCENT_COLORS } from '../services/mockData';
import { AccentTheme, AuthUser } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onSearch: (query: string) => void;
  onHomeClick: () => void;
  onOpenAddChannelModal: () => void;
  onOpenCustomVideoModal: () => void;
  onOpenSettings: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  apiStatus: ApiStatus;
  currentAccent: AccentTheme;
  onChangeAccent: (theme: AccentTheme) => void;
  followedCount: number;
  currentUser: AuthUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onSearch,
  onHomeClick,
  onOpenAddChannelModal,
  onOpenCustomVideoModal,
  onOpenSettings,
  onOpenLoginModal,
  onLogout,
  apiStatus,
  currentAccent,
  onChangeAccent,
  followedCount,
  currentUser,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'Nhạc trẻ remix hay nhất 2026',
    'Review công nghệ AI mới nhất',
    'Gameplay highlight LMHT',
    'Tin tức thế giới 24h',
    'Hướng dẫn lập trình React 19',
    'Khám phá vũ trụ khoa học',
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (s: string) => {
    setSearchInput(s);
    onSearch(s);
    setShowSuggestions(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#222222] bg-[#0F0F0F]/95 px-3 sm:px-4 backdrop-blur-md">
      
      {/* Zone 1: Sidebar Toggle & Brand Wordmark */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#CCCCCC] hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
          title="Mở / Đóng Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Custom Brand Logo: Naotube */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="flex h-8 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-md shadow-[#FF5500]/30 transition-transform duration-200 group-hover:scale-105">
            <Play className="h-4 w-4 fill-current ml-0.5" />
          </div>
          <div className="flex items-center">
            <span className="text-lg font-black tracking-tighter text-white">
              Nao
            </span>
            <span className="text-lg font-black tracking-tighter text-accent">
              tube
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Search Bar with Suggestions */}
      <div
        ref={searchContainerRef}
        className="relative mx-4 hidden sm:flex flex-1 max-w-xl"
      >
        <form onSubmit={handleSearchSubmit} className="flex w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm video trên YouTube..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full rounded-l-full bg-[#121212] py-2 pl-4 pr-10 text-xs sm:text-sm text-white placeholder-[#777777] border border-r-0 border-[#303030] focus:border-accent focus:outline-none transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center justify-center rounded-r-full bg-[#222222] px-5 border border-[#303030] text-[#CCCCCC] hover:bg-[#2A2A2A] hover:text-white transition-colors cursor-pointer"
            title="Tìm kiếm"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-12 left-0 right-12 z-50 overflow-hidden rounded-2xl bg-[#1C1C1C] py-2 shadow-2xl border border-[#2E2E2E]">
            <div className="px-3 py-1 text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
              Tìm kiếm phổ biến
            </div>
            {suggestions
              .filter((s) => !searchInput || s.toLowerCase().includes(searchInput.toLowerCase()))
              .map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(s)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-white transition-colors"
                >
                  <Search className="h-3.5 w-3.5 text-[#777777] shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Zone 3: Actions (Add Channel, Custom Loader, Palette, Login/Profile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* + Thêm Kênh Follow Button */}
        <button
          onClick={onOpenAddChannelModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-accent text-white hover-bg-accent shadow-sm shadow-[#FF5500]/25 transition-all cursor-pointer"
          title="Tìm và thêm kênh YouTube để theo dõi"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Thêm Kênh</span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full tabular-nums">
            {followedCount}
          </span>
        </button>

        {/* Load Custom Video URL CTA */}
        <button
          onClick={onOpenCustomVideoModal}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#222222] border border-[#303030] text-white hover:bg-[#2C2C2C] hover:border-accent transition-colors cursor-pointer"
          title="Dán link YouTube bất kỳ để xem ngay"
        >
          <Upload className="h-3.5 w-3.5 text-accent" />
          <span>Dán Link</span>
        </button>

        {/* Accent Color Quick Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAccentPicker(!showAccentPicker)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#CCCCCC] hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
            title="Đổi tông màu Cam"
          >
            <div
              className="h-4 w-4 rounded-full ring-2 ring-white/20 transition-transform hover:scale-110"
              style={{ backgroundColor: currentAccent.hex }}
            />
          </button>

          {showAccentPicker && (
            <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-[#1C1C1C] p-3 shadow-2xl border border-[#2E2E2E] animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Tông màu Cam</span>
                <span className="text-[10px] text-accent font-mono">{currentAccent.name}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {INITIAL_ACCENT_COLORS.map((theme) => {
                  const isSelected = currentAccent.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onChangeAccent(theme);
                        setShowAccentPicker(false);
                      }}
                      className="group relative flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: theme.hex }}
                      title={theme.name}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#CCCCCC] hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
          title="Cài đặt Naotube"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* User Login / Profile Section */}
        {currentUser && currentUser.isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-9 items-center gap-2 px-2.5 rounded-full bg-[#1F1F1F] hover:bg-[#292929] border border-[#333333] transition-colors cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white text-[11px] font-bold">
                QN
              </div>
              <span className="text-xs font-bold text-white max-w-[80px] truncate hidden sm:inline">
                {currentUser.displayName}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-[#1C1C1C] py-2 shadow-2xl border border-[#2E2E2E]">
                <div className="px-4 py-2 border-b border-[#2A2A2A] mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Shield className="h-3.5 w-3.5 text-accent" />
                    <span>{currentUser.displayName}</span>
                  </div>
                  <p className="text-[10px] text-[#888888] mt-0.5 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    onOpenAddChannelModal();
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#252525] hover:text-white"
                >
                  <Tv2 className="h-4 w-4 text-accent" />
                  <span>Kênh đã theo dõi ({followedCount})</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings();
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#252525] hover:text-white"
                >
                  <Settings className="h-4 w-4 text-accent" />
                  <span>Cài đặt Naotube</span>
                </button>
                <div className="h-[1px] bg-[#2A2A2A] my-1" />
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-white text-xs font-bold hover-bg-accent shadow-md shadow-[#FF5500]/25 transition-all cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Đăng Nhập</span>
          </button>
        )}

      </div>

    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  Tv2,
  History,
  ThumbsUp,
  Bookmark,
  Settings,
  Plus,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ActiveView, FollowedChannel } from '../types';

interface SidebarProps {
  isExpanded: boolean;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  followedChannels: FollowedChannel[];
  savedCount: number;
  likedCount: number;
  historyCount: number;
  onOpenSettings: () => void;
  onOpenAddChannelModal: () => void;
  onSelectChannel?: (channelId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  activeView,
  onNavigate,
  followedChannels,
  savedCount,
  likedCount,
  historyCount,
  onOpenSettings,
  onOpenAddChannelModal,
  onSelectChannel,
}) => {
  const mainNavItems = [
    { id: 'home' as ActiveView, label: 'Trang chủ', icon: Home },
    { id: 'subscriptions' as ActiveView, label: 'Kênh đã Follow', icon: Tv2, count: followedChannels.length },
  ];

  const libraryNavItems = [
    { id: 'history' as ActiveView, label: 'Lịch sử xem', icon: History, count: historyCount },
    { id: 'liked' as ActiveView, label: 'Video đã thích', icon: ThumbsUp, count: likedCount },
    { id: 'library' as ActiveView, label: 'Đã lưu / Ghi chú', icon: Bookmark, count: savedCount },
  ];

  // Collapsed Sidebar (Icons only with small labels)
  if (!isExpanded) {
    return (
      <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-18 shrink-0 flex flex-col items-center py-3 bg-[#0F0F0F] border-r border-[#222222] select-none z-30">
        <div className="flex flex-col gap-2 w-full px-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'text-accent bg-[#1E1E1E]'
                    : 'text-[#AAAAAA] hover:text-white hover:bg-[#1A1A1A]'
                }`}
                title={item.label}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="h-[1px] bg-[#222222] my-1 mx-2" />

          {libraryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'text-accent bg-[#1E1E1E]'
                    : 'text-[#AAAAAA] hover:text-white hover:bg-[#1A1A1A]'
                }`}
                title={item.label}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] font-medium tracking-tight truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="h-[1px] bg-[#222222] my-1 mx-2" />

          <button
            onClick={onOpenAddChannelModal}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-accent hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            title="Thêm kênh follow"
          >
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium tracking-tight">Thêm kênh</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[#AAAAAA] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            title="Cài đặt"
          >
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium tracking-tight">Cài đặt</span>
          </button>
        </div>
      </aside>
    );
  }

  // Expanded Sidebar
  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto bg-[#0F0F0F] border-r border-[#222222] p-3 flex flex-col justify-between select-none z-30">
      <div className="flex flex-col gap-5">
        
        {/* Main Section */}
        <div className="flex flex-col gap-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'text-[#CCCCCC] hover:bg-[#1C1C1C] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-xs font-mono font-medium text-[#888888] tabular-nums">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-[1px] bg-[#222222]" />

        {/* You / Library Section */}
        <div className="flex flex-col gap-1">
          <span className="px-3.5 text-xs font-bold text-[#777777] uppercase tracking-wider mb-1">
            Thư Viện Của Bạn
          </span>
          {libraryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'text-[#CCCCCC] hover:bg-[#1C1C1C] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-xs font-mono font-medium text-[#888888] tabular-nums">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-[1px] bg-[#222222]" />

        {/* Followed Channels Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3.5 mb-1">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
              Kênh Đã Follow ({followedChannels.length})
            </span>
            <button
              onClick={onOpenAddChannelModal}
              className="text-accent hover:text-white transition-colors"
              title="Tìm thêm kênh mới"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {followedChannels.length === 0 ? (
            <div className="px-3.5 py-3 text-xs text-[#777777] bg-[#141414] rounded-xl border border-[#222222]">
              <p className="mb-2">Bạn chưa follow kênh nào.</p>
              <button
                onClick={onOpenAddChannelModal}
                className="w-full py-1.5 px-2 bg-accent/20 text-accent hover:bg-accent hover:text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
              >
                + Thêm kênh yêu thích
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto">
              {followedChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => onSelectChannel ? onSelectChannel(ch.id) : onNavigate('subscriptions')}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-[#CCCCCC] hover:bg-[#1C1C1C] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <img
                    src={ch.avatar}
                    alt={ch.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                        ch.title
                      )}`;
                    }}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <span className="truncate flex-1 text-xs font-medium">{ch.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Settings & Footer */}
      <div className="mt-8 pt-4 border-t border-[#222222] flex flex-col gap-2">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#AAAAAA] hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer"
        >
          <Sliders className="h-4 w-4 text-accent" />
          <span>Cài đặt Naotube</span>
        </button>

        <div className="px-3.5 py-2 text-[11px] text-[#666666] leading-tight">
          <p className="font-semibold text-[#888888]">Naotube Video Platform</p>
          <p className="mt-0.5 text-[#555555]">Chỉ hiển thị kênh follow & video liên quan</p>
        </div>
      </div>
    </aside>
  );
};

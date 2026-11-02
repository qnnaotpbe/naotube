/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Search, Check, Plus, Tv2, Users, Loader2 } from 'lucide-react';
import { FollowedChannel } from '../types';
import { searchChannels } from '../services/youtubeApi';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  followedChannels: FollowedChannel[];
  onToggleFollow: (channel: FollowedChannel) => void;
  onSelectChannel?: (channelId: string) => void;
}

// Popular suggested channels for quick initial following
const POPULAR_SUGGESTIONS: FollowedChannel[] = [
  {
    id: 'UCBJycsmduvYEL83R_U4JriQ',
    title: 'Marques Brownlee',
    handle: '@mkbhd',
    avatar: 'https://yt3.ggpht.com/qu4TmIaYUlS41-dJ9gZ7DUR3nilvmB5_11i6OKSdvNnBNiyOusZP1bMN6ICnuxtjFBb6ioKgRQ=s240-c-k-c0xffffffff-no-rj-mo',
    subscriberCount: '19.2M',
    description: 'Quality Tech Videos | Consumer Electronics | Tech Reviews',
  },
  {
    id: 'UCsBjURrPoezykLs9EqgamOA',
    title: 'Fireship',
    handle: '@fireship',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
    subscriberCount: '3.4M',
    description: 'High-intensity code tutorials to help you ship apps faster.',
  },
  {
    id: 'UCHnyfMqiRRG1u-2MsSQLbXA',
    title: 'Veritasium',
    handle: '@veritasium',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
    subscriberCount: '16.5M',
    description: 'An element of truth - videos about science, education, and everything interesting.',
  },
  {
    id: 'UCsXVk37bltHxD1rDPwtNM8Q',
    title: 'Kurzgesagt – In a Nutshell',
    handle: '@kurzgesagt',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
    subscriberCount: '22.8M',
    description: 'Videos explaining things with optimistic nihilism. Science, nature, and humanity.',
  },
  {
    id: 'UCSJ4gkVC6NrvII8umztf0Ow',
    title: 'Lofi Girl',
    handle: '@lofigirl',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    subscriberCount: '14.5M',
    description: 'Lofi hip hop radio - beats to relax/study to.',
  },
];

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  followedChannels,
  onToggleFollow,
  onSelectChannel,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FollowedChannel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const followedIds = new Set(followedChannels.map((c) => c.id));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchChannels(searchInput.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Channel search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const displayList = hasSearched ? searchResults : POPULAR_SUGGESTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#181818] border border-[#2E2E2E] shadow-2xl p-6 text-white max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Tv2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Tìm & Theo Dõi Kênh (Follow)</h2>
              <p className="text-xs text-[#888888]">
                Feed chỉ hiển thị video từ kênh bạn follow và video đề xuất liên quan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-[#252525] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Nhập tên kênh YouTube, @handle hoặc từ khóa..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl bg-[#121212] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-[#777777] border border-[#333333] focus:border-accent focus:outline-none transition-colors"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777777]" />
          </div>

          <button
            type="submit"
            disabled={!searchInput.trim() || isSearching}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover-bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tìm kiếm'}
          </button>
        </form>

        {/* Sub-header text */}
        <div className="flex items-center justify-between text-xs text-[#888888] mb-2 px-1">
          <span>{hasSearched ? `Kết quả tìm kiếm (${searchResults.length})` : 'Gợi ý kênh phổ biến'}</span>
          <span>Đã theo dõi: <strong className="text-accent">{followedChannels.length}</strong> kênh</span>
        </div>

        {/* Channel List Container */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {isSearching ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              <p className="text-xs text-[#AAAAAA]">Đang tìm kênh trên YouTube...</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#777777]">
              Không tìm thấy kênh phù hợp. Thử tìm với tên kênh khác.
            </div>
          ) : (
            displayList.map((ch) => {
              const isFollowed = followedIds.has(ch.id);

              return (
                <div
                  key={ch.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1F1F1F] hover:bg-[#252525] border border-[#2B2B2B] transition-colors"
                >
                  <div
                    onClick={() => {
                      if (onSelectChannel) {
                        onSelectChannel(ch.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                    title={`Xem kênh ${ch.title}`}
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
                      className="h-11 w-11 rounded-full object-cover shrink-0 ring-1 ring-white/10 group-hover:scale-105 transition-transform"
                    />

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-accent transition-colors">
                        {ch.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-[#AAAAAA]">
                        {ch.handle && <span>{ch.handle}</span>}
                        {ch.subscriberCount && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{ch.subscriberCount} subs</span>
                          </>
                        )}
                      </div>
                      {ch.description && (
                        <p className="text-[11px] text-[#777777] line-clamp-1 mt-0.5">
                          {ch.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleFollow(ch)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isFollowed
                        ? 'bg-[#2E2E2E] text-[#AAAAAA] hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-500/40 border border-transparent'
                        : 'bg-accent text-white hover-bg-accent shadow-sm shadow-[#FF5500]/30'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Đã Follow</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex justify-between items-center text-xs">
          <p className="text-[#777777] text-[11px]">
            Follow ít nhất 1 kênh để cập nhật video mới nhất trên trang chủ!
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover-bg-accent transition-colors"
          >
            Xong
          </button>
        </div>

      </div>
    </div>
  );
};

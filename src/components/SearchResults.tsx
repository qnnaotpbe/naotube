/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Bookmark, Share2, Plus, Check, Tv2 } from 'lucide-react';
import { VideoItem, FollowedChannel } from '../types';
import { formatViews, formatTimeAgo } from '../services/mockData';

interface SearchResultsProps {
  query: string;
  videos: VideoItem[];
  channels?: FollowedChannel[];
  isLoading: boolean;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  onToggleBookmark: (video: VideoItem) => void;
  bookmarkedIds: Set<string>;
  followedChannels: FollowedChannel[];
  onToggleFollowChannel: (channel: FollowedChannel) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  videos,
  channels = [],
  isLoading,
  onSelectVideo,
  onSelectChannel,
  onToggleBookmark,
  bookmarkedIds,
  followedChannels,
  onToggleFollowChannel,
}) => {
  const followedIds = new Set(followedChannels.map((c) => c.id));

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-4 animate-pulse">
            <div className="w-full sm:w-80 aspect-video rounded-xl bg-[#222222] shrink-0" />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-5 w-4/5 rounded bg-[#222222]" />
              <div className="h-3 w-1/3 rounded bg-[#222222]" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#222222]" />
                <div className="h-3 w-28 rounded bg-[#222222]" />
              </div>
              <div className="h-3 w-full rounded bg-[#222222]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-[#222222]">
        <h2 className="text-lg font-bold text-white">
          Kết quả tìm kiếm cho <span className="text-accent">"{query}"</span>
        </h2>
        <p className="text-xs text-[#888888] mt-1 tabular-nums">
          Tìm thấy {channels.length > 0 ? `${channels.length} kênh và ` : ''}{videos.length} video
        </p>
      </div>

      {/* MATCHING CHANNELS (YouTube Style Featured Channel Cards) */}
      {channels.length > 0 && (
        <div className="mb-6 pb-6 border-b border-[#242424] space-y-3">
          {channels.slice(0, 2).map((ch) => {
            const isFollowed = followedIds.has(ch.id);

            return (
              <div
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <img
                    src={ch.avatar}
                    alt={ch.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                        ch.title
                      )}`;
                    }}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover shrink-0 ring-2 ring-white/10 group-hover:scale-105 transition-transform"
                  />

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-accent transition-colors truncate">
                        {ch.title}
                      </h3>
                      <CheckCircle2 className="h-4 w-4 text-[#888888] shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#AAAAAA] mt-0.5">
                      {ch.handle && <span>{ch.handle}</span>}
                      {ch.subscriberCount && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums font-semibold text-white">
                            {ch.subscriberCount} người đăng ký
                          </span>
                        </>
                      )}
                      {ch.videoCount && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{ch.videoCount}</span>
                        </>
                      )}
                    </div>

                    {ch.description && (
                      <p className="text-xs text-[#888888] line-clamp-1 mt-1">
                        {ch.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFollowChannel(ch);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isFollowed
                        ? 'bg-[#2E2E2E] text-[#CCCCCC] hover:bg-rose-950/40 hover:text-rose-400'
                        : 'bg-accent text-white hover-bg-accent shadow-md shadow-[#FF5500]/30'
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
                        <span>Follow Kênh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIDEO RESULTS */}
      {videos.length === 0 && channels.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-white font-medium mb-1">Không tìm thấy kết quả nào</p>
          <p className="text-xs text-[#888888]">
            Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {videos.map((video) => {
            const isBookmarked = bookmarkedIds.has(video.id);

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="group flex flex-col sm:flex-row gap-4 p-2 rounded-2xl hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-80 aspect-video rounded-xl overflow-hidden bg-[#222222] shrink-0">
                  <img
                    src={video.thumbnails.high || video.thumbnails.medium}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-mono text-white">
                    {video.duration}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 justify-start py-1">
                  <h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-accent transition-colors leading-snug">
                    {video.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#888888] mt-1">
                    <span className="tabular-nums">{formatViews(video.viewCount)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatTimeAgo(video.publishedAt)}</span>
                  </div>

                  {/* Channel info with click to channel page */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChannel(video.channelId);
                    }}
                    className="flex items-center gap-2 my-2.5 hover:opacity-80 transition-opacity w-fit cursor-pointer"
                    title={`Xem kênh ${video.channelTitle}`}
                  >
                    <img
                      src={video.channelAvatar}
                      alt={video.channelTitle}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                          video.channelTitle
                        )}`;
                      }}
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <span className="text-xs text-[#CCCCCC] font-medium truncate hover:text-accent hover:underline transition-colors">
                      {video.channelTitle}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#888888] shrink-0" />
                  </div>

                  {/* Description snippet */}
                  <p className="line-clamp-2 text-xs text-[#999999] leading-relaxed">
                    {video.description}
                  </p>

                  {/* Action buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(video);
                      }}
                      className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-accent/15 border-accent text-accent'
                          : 'border-[#333333] text-[#AAAAAA] hover:bg-[#252525] hover:text-white'
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span>{isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(`https://www.youtube.com/watch?v=${video.id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg border border-[#333333] text-[#AAAAAA] hover:bg-[#252525] hover:text-white transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Chia sẻ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

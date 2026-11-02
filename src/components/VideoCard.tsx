/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, Bookmark, Share2, Play } from 'lucide-react';
import { VideoItem } from '../types';
import { formatViews, formatTimeAgo } from '../services/mockData';

interface VideoCardProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
  onToggleBookmark?: (video: VideoItem) => void;
  isBookmarked?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelectVideo,
  onSelectChannel,
  onToggleBookmark,
  isBookmarked = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const thumbnailSrc = imageError
    ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
    : video.thumbnails.high || video.thumbnails.medium || video.thumbnails.default;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(video);
    }
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    if (onSelectChannel) {
      e.stopPropagation();
      onSelectChannel(video.channelId);
    }
  };

  return (
    <div
      onClick={() => onSelectVideo(video)}
      className="group flex flex-col gap-3 cursor-pointer rounded-xl p-2 transition-all duration-200 hover:bg-[#1E1E1E]"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#1a1a1a]">
        <img
          src={thumbnailSrc}
          alt={video.title}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-mono font-medium text-white shadow-sm">
          {video.duration || '10:00'}
        </div>

        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-[#FF5500]/40 transition-transform duration-200 group-hover:scale-110">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Quick action buttons on hover */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={handleBookmark}
            title={isBookmarked ? 'Bỏ lưu' : 'Lưu video'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg backdrop-blur-md transition-colors ${
              isBookmarked
                ? 'bg-accent text-white'
                : 'bg-black/70 text-white hover:bg-black/90'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            title={copied ? 'Đã sao chép!' : 'Sao chép link'}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur-md transition-colors hover:bg-black/90"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {copied && (
          <div className="absolute bottom-2 left-2 rounded bg-[#111111]/90 px-2 py-1 text-[11px] font-medium text-white shadow">
            Đã sao chép link!
          </div>
        )}
      </div>

      {/* Details Row */}
      <div className="flex gap-3 px-0.5">
        {/* Channel Avatar with click to channel page */}
        <div
          onClick={handleChannelClick}
          className="shrink-0 pt-0.5 hover:scale-105 transition-transform"
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
            className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
          />
        </div>

        {/* Text Info */}
        <div className="flex flex-col min-w-0 flex-1">
          <h3
            title={video.title}
            className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#FF8844]"
          >
            {video.title}
          </h3>

          <div
            onClick={handleChannelClick}
            className="mt-1 flex items-center gap-1.5 text-xs text-[#AAAAAA] hover:text-white transition-colors w-fit"
            title={`Xem kênh ${video.channelTitle}`}
          >
            <span className="truncate hover:underline">
              {video.channelTitle}
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#888888]" />
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#888888]">
            <span className="tabular-nums">{formatViews(video.viewCount)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatTimeAgo(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

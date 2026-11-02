/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Bookmark, Share2 } from 'lucide-react';
import { VideoItem } from '../types';
import { formatViews, formatTimeAgo } from '../services/mockData';

interface SearchResultsProps {
  query: string;
  videos: VideoItem[];
  isLoading: boolean;
  onSelectVideo: (video: VideoItem) => void;
  onToggleBookmark: (video: VideoItem) => void;
  bookmarkedIds: Set<string>;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  videos,
  isLoading,
  onSelectVideo,
  onToggleBookmark,
  bookmarkedIds,
}) => {
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
      {/* Header with results metadata */}
      <div className="mb-6 pb-4 border-b border-[#222222]">
        <h2 className="text-lg font-bold text-white">
          Results for <span className="text-accent">"{query}"</span>
        </h2>
        <p className="text-xs text-[#888888] mt-1 tabular-nums">
          Found {videos.length} videos matching your search
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-white font-medium mb-1">No results found</p>
          <p className="text-xs text-[#888888]">
            Try different keywords or check spelling.
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

                  {/* Channel info */}
                  <div className="flex items-center gap-2 my-2.5">
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
                    <span className="text-xs text-[#CCCCCC] font-medium truncate">
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
                      <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(`https://www.youtube.com/watch?v=${video.id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg border border-[#333333] text-[#AAAAAA] hover:bg-[#252525] hover:text-white transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
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

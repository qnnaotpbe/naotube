/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VideoCard } from './VideoCard';
import { VideoItem } from '../types';
import { Film } from 'lucide-react';

interface VideoGridProps {
  videos: VideoItem[];
  isLoading: boolean;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
  onToggleBookmark: (video: VideoItem) => void;
  bookmarkedIds: Set<string>;
  emptyMessage?: string;
  onResetFilter?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  isLoading,
  onSelectVideo,
  onSelectChannel,
  onToggleBookmark,
  bookmarkedIds,
  emptyMessage = 'Không tìm thấy video nào.',
  onResetFilter,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-7 p-4 sm:p-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3 animate-pulse">
            <div className="aspect-video w-full rounded-xl bg-[#222222]" />
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-[#222222] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-5/6 rounded bg-[#222222]" />
                <div className="h-3 w-1/2 rounded bg-[#222222]" />
                <div className="h-3 w-1/3 rounded bg-[#222222]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E1E1E] text-accent mb-4 border border-[#333333]">
          <Film className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{emptyMessage}</h3>
        <p className="text-sm text-[#AAAAAA] max-w-md mb-6">
          Thử chọn danh mục khác hoặc tìm kiếm với từ khóa mới.
        </p>
        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-white hover-bg-accent transition-colors cursor-pointer"
          >
            Về Trang Chủ
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-7 p-4 sm:p-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onSelectVideo={onSelectVideo}
          onSelectChannel={onSelectChannel}
          onToggleBookmark={onToggleBookmark}
          isBookmarked={bookmarkedIds.has(video.id)}
        />
      ))}
    </div>
  );
};

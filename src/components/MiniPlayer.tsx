/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Maximize2, X, Play } from 'lucide-react';
import { VideoItem } from '../types';

interface MiniPlayerProps {
  video: VideoItem;
  onMaximize: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  video,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden bg-[#181818] border border-[#333333] shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#222222] border-b border-[#2C2C2C]">
        <span className="text-xs font-semibold text-white truncate max-w-[220px]">
          {video.title}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMaximize}
            className="p-1 rounded-md text-[#AAAAAA] hover:text-white hover:bg-[#2F2F2F] transition-colors"
            title="Mở rộng toàn màn hình"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#AAAAAA] hover:text-white hover:bg-[#2F2F2F] transition-colors"
            title="Đóng mini-player"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded iframe */}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&enablejsapi=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      {/* Channel info banner */}
      <div
        onClick={onMaximize}
        className="flex items-center justify-between p-2.5 bg-[#181818] hover:bg-[#222222] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={video.channelAvatar}
            alt={video.channelTitle}
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="text-xs text-[#CCCCCC] truncate">
            {video.channelTitle}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-accent flex items-center gap-1">
          <Play className="h-3 w-3 fill-current" />
          Xem tiếp
        </span>
      </div>
    </div>
  );
};

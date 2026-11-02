/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Tv2,
  Calendar,
  Eye,
  Film,
  Plus,
  Check,
  Share2,
  ArrowLeft,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { FollowedChannel, VideoItem } from '../types';
import { fetchChannelDetails, fetchChannelVideos } from '../services/youtubeApi';
import { VideoCard } from './VideoCard';

interface ChannelPageProps {
  channelId: string;
  initialChannel?: FollowedChannel | null;
  onSelectVideo: (video: VideoItem) => void;
  onToggleBookmark: (video: VideoItem) => void;
  bookmarkedIds: Set<string>;
  followedChannels: FollowedChannel[];
  onToggleFollowChannel: (channel: FollowedChannel) => void;
  onBack: () => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({
  channelId,
  initialChannel,
  onSelectVideo,
  onToggleBookmark,
  bookmarkedIds,
  followedChannels,
  onToggleFollowChannel,
  onBack,
}) => {
  const [channel, setChannel] = useState<FollowedChannel | null>(initialChannel || null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');
  const [sortOrder, setSortOrder] = useState<'date' | 'viewCount'>('date');
  const [shareCopied, setShareCopied] = useState(false);

  const isFollowed = channel ? followedChannels.some((c) => c.id === channel.id) : false;

  // Fetch complete channel metadata and videos
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const details = await fetchChannelDetails(channelId);
        if (isMounted && details) {
          setChannel(details);
        }

        const vids = await fetchChannelVideos(channelId, sortOrder, 30);
        if (isMounted) {
          setVideos(vids);
        }
      } catch (err) {
        console.error('Error loading channel page:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [channelId, sortOrder]);

  const handleShare = () => {
    navigator.clipboard?.writeText(`https://www.youtube.com/channel/${channelId}`);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  if (isLoading && !channel) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
        <p className="text-xs text-[#888888]">Đang tải thông tin kênh YouTube...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-base text-white font-bold mb-2">Không tìm thấy kênh</p>
        <p className="text-xs text-[#888888] mb-4">Kênh này không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-20">
      
      {/* Top Back navigation */}
      <div className="px-4 sm:px-8 py-3 flex items-center gap-3 border-b border-[#222222]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Channel Banner */}
      <div className="relative w-full h-36 sm:h-52 md:h-64 bg-gradient-to-r from-[#1E1E1E] via-[#2A1E14] to-[#141414] overflow-hidden">
        {channel.banner ? (
          <img
            src={channel.banner}
            alt={channel.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <Tv2 className="h-20 w-20 text-accent" />
          </div>
        )}
      </div>

      {/* Channel Info Header (YouTube Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6 border-b border-[#242424]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          
          {/* Avatar */}
          <div className="relative -mt-12 sm:-mt-16 shrink-0">
            <img
              src={channel.avatar}
              alt={channel.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  channel.title
                )}`;
              }}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover ring-4 ring-[#0F0F0F] shadow-2xl bg-[#1C1C1C]"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                {channel.title}
              </h1>
              <CheckCircle2 className="h-5 w-5 text-[#888888] shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#AAAAAA] mt-1.5">
              {channel.handle && (
                <span className="font-semibold text-white">{channel.handle}</span>
              )}
              {channel.subscriberCount && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{channel.subscriberCount} người đăng ký</span>
                </>
              )}
              {channel.videoCount && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{channel.videoCount}</span>
                </>
              )}
            </div>

            {channel.description && (
              <p className="mt-2 text-xs sm:text-sm text-[#888888] line-clamp-2 max-w-3xl leading-relaxed">
                {channel.description}
              </p>
            )}
          </div>

          {/* Actions: Follow / Share */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto mt-2 sm:mt-0">
            <button
              onClick={() => onToggleFollowChannel(channel)}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isFollowed
                  ? 'bg-[#2A2A2A] text-[#CCCCCC] hover:bg-rose-950/40 hover:text-rose-400'
                  : 'bg-accent text-white hover-bg-accent shadow-lg shadow-[#FF5500]/30'
              }`}
            >
              {isFollowed ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Đã Follow</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Follow Kênh</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-[#222222] border border-[#333333] text-[#CCCCCC] hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              title="Sao chép link kênh"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {shareCopied && (
              <span className="text-xs text-emerald-400 font-semibold">Đã chép!</span>
            )}
          </div>

        </div>

        {/* Navigation Tabs (Video & Giới thiệu) */}
        <div className="flex items-center gap-6 mt-8 pt-2 border-t border-[#222222]">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'videos'
                ? 'border-accent text-white'
                : 'border-transparent text-[#888888] hover:text-[#CCCCCC]'
            }`}
          >
            Video ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-accent text-white'
                : 'border-transparent text-[#888888] hover:text-[#CCCCCC]'
            }`}
          >
            Giới Thiệu Kênh
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {activeTab === 'videos' && (
          <div className="flex flex-col gap-5">
            {/* Sort Sub-bar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
              <span className="text-xs text-[#888888]">
                {videos.length} video mới nhất từ {channel.title}
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-[#1A1A1A] rounded-lg border border-[#2B2B2B]">
                <button
                  onClick={() => setSortOrder('date')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    sortOrder === 'date'
                      ? 'bg-accent text-white'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSortOrder('viewCount')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    sortOrder === 'viewCount'
                      ? 'bg-accent text-white'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Phổ biến nhất
                </button>
              </div>
            </div>

            {/* Video Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 py-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex flex-col gap-2 animate-pulse">
                    <div className="aspect-video w-full rounded-xl bg-[#222222]" />
                    <div className="h-4 w-3/4 rounded bg-[#222222]" />
                    <div className="h-3 w-1/2 rounded bg-[#222222]" />
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#777777]">
                Kênh này chưa có video nào được tải lên.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-7">
                {videos.map((vid) => (
                  <VideoCard
                    key={vid.id}
                    video={vid}
                    onSelectVideo={onSelectVideo}
                    onToggleBookmark={onToggleBookmark}
                    isBookmarked={bookmarkedIds.has(vid.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
            <div className="md:col-span-2 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white">Mô tả kênh</h3>
              <p className="whitespace-pre-line text-sm text-[#CCCCCC] leading-relaxed bg-[#141414] p-5 rounded-2xl border border-[#242424]">
                {channel.description || 'Không có mô tả chi tiết cho kênh này.'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-white">Thống kê kênh</h3>
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#141414] border border-[#242424] text-xs">
                {channel.joinedDate && (
                  <div className="flex items-center gap-3 text-[#CCCCCC]">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>Đã tham gia {channel.joinedDate}</span>
                  </div>
                )}
                {channel.totalViews && (
                  <div className="flex items-center gap-3 text-[#CCCCCC]">
                    <Eye className="h-4 w-4 text-accent" />
                    <span>{channel.totalViews}</span>
                  </div>
                )}
                {channel.videoCount && (
                  <div className="flex items-center gap-3 text-[#CCCCCC]">
                    <Film className="h-4 w-4 text-accent" />
                    <span>{channel.videoCount}</span>
                  </div>
                )}
                {channel.subscriberCount && (
                  <div className="flex items-center gap-3 text-[#CCCCCC]">
                    <Tv2 className="h-4 w-4 text-accent" />
                    <span>{channel.subscriberCount} người đăng ký</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

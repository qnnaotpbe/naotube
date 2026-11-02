/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Sparkles,
  Clock,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Tv2,
  Download,
} from 'lucide-react';
import { VideoItem, CommentItem, BookmarkNote, AISummaryData, FollowedChannel } from '../types';
import {
  formatViews,
  formatTimeAgo,
  formatSecondsToTime,
} from '../services/mockData';
import { fetchVideoComments, fetchRelatedVideos } from '../services/youtubeApi';
import { generateVideoSummary } from '../services/aiSummarizer';

interface WatchPageProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onToggleBookmark: (video: VideoItem) => void;
  isBookmarked: boolean;
  onBackToHome: () => void;
  followedChannels: FollowedChannel[];
  onToggleFollowChannel: (channel: FollowedChannel) => void;
  onLaunchMiniPlayer?: (video: VideoItem) => void;
  onSelectChannel?: (channelId: string) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  onSelectVideo,
  onToggleBookmark,
  isBookmarked,
  followedChannels,
  onToggleFollowChannel,
  onLaunchMiniPlayer,
  onSelectChannel,
}) => {
  // Player state
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [playerCurrentTime, setPlayerCurrentTime] = useState<number>(0);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  // Video interaction state
  const [likes, setLikes] = useState<number>(parseInt(video.likeCount || '1000', 10));
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [hasDisliked, setHasDisliked] = useState<boolean>(false);
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Bookmarks / Timestamp notes state (persisted in localStorage per video)
  const [bookmarks, setBookmarks] = useState<BookmarkNote[]>([]);
  const [noteInput, setNoteInput] = useState<string>('');
  const [customTimestampSec, setCustomTimestampSec] = useState<number | null>(null);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true);

  // Related videos live from API
  const [liveRelatedVideos, setLiveRelatedVideos] = useState<VideoItem[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState<boolean>(true);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [summaryCopied, setSummaryCopied] = useState<boolean>(false);

  // Active right column tab: 'summary' or 'related'
  const [rightTab, setRightTab] = useState<'related' | 'summary'>('related');

  const isFollowed = followedChannels.some((c) => c.id === video.channelId);

  // Load subscriptions & likes from localStorage
  useEffect(() => {
    try {
      const storedLikes = JSON.parse(localStorage.getItem('naotube_liked_ids') || '[]');
      setHasLiked(storedLikes.includes(video.id));

      const storedNotes = JSON.parse(
        localStorage.getItem(`naotube_notes_${video.id}`) || '[]'
      );
      setBookmarks(storedNotes);
    } catch {
      // Ignore storage errors
    }

    setLikes(parseInt(video.likeCount || '1000', 10));
    setHasDisliked(false);
    setShowFullDesc(false);
    setAiSummary(null);
  }, [video.id]);

  // Load comments
  useEffect(() => {
    let isMounted = true;
    setIsLoadingComments(true);
    fetchVideoComments(video.id).then((fetched) => {
      if (isMounted) {
        setComments(fetched);
        setIsLoadingComments(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [video.id]);

  // Load real live related videos
  useEffect(() => {
    let isMounted = true;
    setIsLoadingRelated(true);
    fetchRelatedVideos(video.id, video.title, video.channelTitle).then((vids) => {
      if (isMounted) {
        setLiveRelatedVideos(vids);
        setIsLoadingRelated(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [video.id, video.title, video.channelTitle]);

  // Initialize YouTube Iframe Player API
  useEffect(() => {
    let timer: any;

    const initYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        try {
          ytPlayerRef.current = new (window as any).YT.Player('naotube-yt-player', {
            events: {
              onReady: () => {
                timer = setInterval(() => {
                  if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
                    const ct = ytPlayerRef.current.getCurrentTime();
                    if (typeof ct === 'number' && !isNaN(ct)) {
                      setPlayerCurrentTime(Math.floor(ct));
                    }
                  }
                }, 1000);
              },
            },
          });
        } catch (e) {
          console.warn('YouTube Player initialization notice:', e);
        }
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initYT;
    } else {
      initYT();
    }

    return () => {
      if (timer) clearInterval(timer);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
      }
    };
  }, [video.id]);

  // Seek helper
  const seekVideoTo = (seconds: number) => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
        ytPlayerRef.current.playVideo?.();
        return;
      } catch {}
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true],
        }),
        '*'
      );
    }
  };

  // Add Bookmark note
  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    let targetSec = customTimestampSec !== null ? customTimestampSec : playerCurrentTime;
    if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
      try {
        const ct = ytPlayerRef.current.getCurrentTime();
        if (typeof ct === 'number' && !isNaN(ct)) {
          targetSec = Math.floor(ct);
        }
      } catch {}
    }

    const newBookmark: BookmarkNote = {
      id: `bn_${Date.now()}`,
      videoId: video.id,
      timestampSeconds: targetSec,
      timestampFormatted: formatSecondsToTime(targetSec),
      note: noteInput.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...bookmarks, newBookmark].sort(
      (a, b) => a.timestampSeconds - b.timestampSeconds
    );
    setBookmarks(updated);
    setNoteInput('');
    setCustomTimestampSec(null);

    try {
      localStorage.setItem(`naotube_notes_${video.id}`, JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem(`naotube_notes_${video.id}`, JSON.stringify(updated));
    } catch {}
  };

  // Export notes as file
  const handleExportNotes = () => {
    if (bookmarks.length === 0) return;
    const content = `Ghi chú Naotube cho video: ${video.title}\nLink: https://www.youtube.com/watch?v=${video.id}\nKênh: ${video.channelTitle}\n\n` +
      bookmarks.map((b) => `[${b.timestampFormatted}] ${b.note}`).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naotube-notes-${video.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Like handler
  const handleToggleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
      try {
        const storedLikes = JSON.parse(localStorage.getItem('naotube_liked_ids') || '[]');
        localStorage.setItem(
          'naotube_liked_ids',
          JSON.stringify(storedLikes.filter((id: string) => id !== video.id))
        );
      } catch {}
    } else {
      setHasLiked(true);
      if (hasDisliked) setHasDisliked(false);
      setLikes((prev) => prev + 1);
      try {
        const storedLikes = JSON.parse(localStorage.getItem('naotube_liked_ids') || '[]');
        if (!storedLikes.includes(video.id)) {
          storedLikes.push(video.id);
          localStorage.setItem('naotube_liked_ids', JSON.stringify(storedLikes));
        }
      } catch {}
    }
  };

  const handleToggleDislike = () => {
    if (hasDisliked) {
      setHasDisliked(false);
    } else {
      setHasDisliked(true);
      if (hasLiked) {
        setHasLiked(false);
        setLikes((prev) => Math.max(0, prev - 1));
      }
    }
  };

  // Follow Channel
  const handleFollowClick = () => {
    onToggleFollowChannel({
      id: video.channelId,
      title: video.channelTitle,
      avatar: video.channelAvatar,
      subscriberCount: video.subscriberCount,
    });
  };

  // Share handler
  const handleShare = () => {
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    navigator.clipboard?.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2200);
  };

  // Add Comment handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `local_comment_${Date.now()}`,
      authorName: 'Bạn (Naotuber)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      text: commentInput.trim(),
      publishedAt: new Date().toISOString(),
      likes: 0,
      isAuthor: true,
    };

    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  // AI Summary generator trigger
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setRightTab('summary');
    try {
      const summary = await generateVideoSummary(video);
      setAiSummary(summary);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (!aiSummary) return;
    const text = `Tóm tắt AI Naotube: ${video.title}\n\nTL;DR: ${aiSummary.tldr}\n\nÝ chính:\n${aiSummary.keyTakeaways.map((k) => `• ${k}`).join('\n')}\n\nCác mốc quan trọng:\n${aiSummary.chapters.map((c) => `${c.timestamp} - ${c.title}`).join('\n')}\n\nĐánh giá: ${aiSummary.actionableVerdict}`;
    navigator.clipboard?.writeText(text);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-4 lg:p-6 pb-20">
      
      {/* Theater Mode Top Player View */}
      {isTheaterMode && (
        <div className="w-full max-w-7xl mx-auto mb-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-[#222222]">
            <iframe
              id="naotube-yt-player-theater"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1700px] grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ================= LEFT 2 COLUMNS: VIDEO & DETAILS ================= */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          
          {/* Main YouTube Iframe Player Container (when not theater mode) */}
          {!isTheaterMode && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-[#222222]">
              <iframe
                id="naotube-yt-player"
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          )}

          {/* Video Title */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mt-1">
            {video.title}
          </h1>

          {/* Video Metadata & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
            
            {/* Channel Info & Subscribe / Follow Button */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => onSelectChannel && onSelectChannel(video.channelId)}
                className="cursor-pointer hover:scale-105 transition-transform"
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
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
                />
              </div>
              <div
                onClick={() => onSelectChannel && onSelectChannel(video.channelId)}
                className="cursor-pointer"
                title={`Xem kênh ${video.channelTitle}`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-white hover:text-accent hover:underline transition-colors">
                  <span>{video.channelTitle}</span>
                  <CheckCircle2 className="h-4 w-4 text-[#888888]" />
                </div>
                <div className="text-xs text-[#AAAAAA]">
                  {video.subscriberCount ? `${video.subscriberCount} người đăng ký` : 'Kênh YouTube'}
                </div>
              </div>

              <button
                onClick={handleFollowClick}
                className={`ml-3 px-4 py-2 text-xs font-bold rounded-full transition-all duration-150 cursor-pointer ${
                  isFollowed
                    ? 'bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#333333]'
                    : 'bg-accent text-white hover-bg-accent shadow-md shadow-[#FF5500]/25'
                }`}
              >
                {isFollowed ? 'Đang Follow' : 'Follow Kênh'}
              </button>
            </div>

            {/* Actions: Like, Dislike, Share, Bookmark, Theater, AI Summary */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Like / Dislike */}
              <div className="flex items-center rounded-full bg-[#222222] border border-[#303030] overflow-hidden">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                    hasLiked ? 'text-accent bg-[#2e231c]' : 'text-[#E0E0E0] hover:bg-[#2c2c2c]'
                  }`}
                  title="Thích video này"
                >
                  <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span className="tabular-nums font-semibold">{formatViews(likes).replace(' views', '')}</span>
                </button>
                <div className="h-4 w-[1px] bg-[#3a3a3a]" />
                <button
                  onClick={handleToggleDislike}
                  className={`px-3 py-2 text-xs transition-colors ${
                    hasDisliked ? 'text-accent bg-[#2e231c]' : 'text-[#AAAAAA] hover:bg-[#2c2c2c]'
                  }`}
                  title="Không thích"
                >
                  <ThumbsDown className={`h-4 w-4 ${hasDisliked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Theater Mode toggle */}
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  isTheaterMode
                    ? 'bg-accent text-white border-accent'
                    : 'bg-[#222222] border-[#303030] text-[#CCCCCC] hover:bg-[#2c2c2c]'
                }`}
                title={isTheaterMode ? 'Thu nhỏ chế độ rạp phim' : 'Mở rộng chế độ rạp phim'}
              >
                {isTheaterMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Mini-player button */}
              {onLaunchMiniPlayer && (
                <button
                  onClick={() => onLaunchMiniPlayer(video)}
                  className="p-2 rounded-full bg-[#222222] border border-[#303030] text-[#CCCCCC] hover:bg-[#2c2c2c] transition-colors cursor-pointer"
                  title="Thu nhỏ thành Mini-Player"
                >
                  <Tv2 className="h-4 w-4 text-accent" />
                </button>
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-[#222222] border border-[#303030] text-[#E0E0E0] hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              >
                {shareCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>Chia sẻ</span>
                  </>
                )}
              </button>

              {/* Bookmark / Save */}
              <button
                onClick={() => onToggleBookmark(video)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'bg-[#222222] border-[#303030] text-[#E0E0E0] hover:bg-[#2c2c2c]'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
              </button>

              {/* AI Summarize CTA button */}
              <button
                onClick={handleGenerateSummary}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-accent text-white hover-bg-accent shadow-sm shadow-[#FF5500]/30 transition-colors cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Tóm Tắt AI</span>
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="group cursor-pointer rounded-2xl bg-[#1C1C1C] p-4 text-sm transition-colors hover:bg-[#222222] border border-[#2A2A2A]"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
              <span className="tabular-nums">{formatViews(video.viewCount)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatTimeAgo(video.publishedAt)}</span>
            </div>

            <div className={`whitespace-pre-line text-[#CCCCCC] text-xs sm:text-sm leading-relaxed ${showFullDesc ? '' : 'line-clamp-3'}`}>
              {video.description}
            </div>

            <button className="mt-2 flex items-center gap-1 text-xs font-bold text-white group-hover:text-accent transition-colors">
              {showFullDesc ? (
                <>
                  <span>Thu gọn</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>Hiện thêm</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          {/* ================= TIMESTAMP NOTES & BOOKMARKS ================= */}
          <div className="rounded-2xl bg-[#181818] p-5 border border-[#2B2B2B]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ghi Chú Theo Mốc Thời Gian (Bookmarks)</h3>
                  <p className="text-xs text-[#888888]">Lưu lại các đoạn video quan trọng để mở lại đúng giây đó</p>
                </div>
              </div>

              {bookmarks.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportNotes}
                    className="flex items-center gap-1 text-xs text-accent hover:underline cursor-pointer"
                    title="Tải ghi chú về máy"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Xuất file</span>
                  </button>
                  <span className="text-xs font-mono text-[#888888] tabular-nums">
                    {bookmarks.length} ghi chú
                  </span>
                </div>
              )}
            </div>

            {/* Note Input Form */}
            <form onSubmit={handleAddBookmark} className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
                      try {
                        const ct = Math.floor(ytPlayerRef.current.getCurrentTime());
                        setCustomTimestampSec(ct);
                      } catch {}
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#252525] border border-[#333333] text-xs font-mono font-medium text-accent hover:bg-[#2E2E2E] transition-colors whitespace-nowrap cursor-pointer"
                  title="Lấy thời gian hiện tại từ trình phát"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>
                    {customTimestampSec !== null
                      ? formatSecondsToTime(customTimestampSec)
                      : formatSecondsToTime(playerCurrentTime)}
                  </span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Viết ghi chú cho giây này (ví dụ: 'Đoạn phân tích hay nhất')..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="flex-1 rounded-lg bg-[#121212] px-3.5 py-2 text-xs text-white border border-[#333333] focus:border-accent focus:outline-none transition-colors"
              />

              <button
                type="submit"
                disabled={!noteInput.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover-bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Lưu Ghi Chú</span>
              </button>
            </form>

            {/* Bookmarks List */}
            {bookmarks.length === 0 ? (
              <div className="text-center py-5 text-xs text-[#777777] border border-dashed border-[#2B2B2B] rounded-xl">
                Chưa có ghi chú nào. Nhấn dừng hoặc phát video rồi bấm nút cam để lưu mốc thời gian.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {bookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#1F1F1F] hover:bg-[#252525] transition-colors border border-[#2A2A2A] group"
                  >
                    <button
                      onClick={() => seekVideoTo(b.timestampSeconds)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#2D2D2D] hover:bg-accent text-accent hover:text-white font-mono text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                      title="Nhảy đến giây này"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>{b.timestampFormatted}</span>
                    </button>

                    <span className="flex-1 text-xs text-[#E0E0E0] truncate">
                      {b.note}
                    </span>

                    <button
                      onClick={() => handleDeleteBookmark(b.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#888888] hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= COMMENTS SECTION ================= */}
          <div className="flex flex-col gap-4 pt-4">
            <h2 className="text-lg font-bold text-white">
              Bình Luận ({comments.length})
            </h2>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-xs">
                BẠN
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Thêm bình luận cho video này..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-transparent border-b border-[#333333] pb-1.5 text-sm text-white placeholder-[#777777] focus:border-accent focus:outline-none transition-colors"
                />
                {commentInput.trim() && (
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setCommentInput('')}
                      className="px-3 py-1.5 text-xs text-[#AAAAAA] hover:text-white cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold rounded-full bg-accent text-white hover-bg-accent transition-colors cursor-pointer"
                    >
                      Bình luận
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="space-y-4 py-4">
                {[1, 2].map((n) => (
                  <div key={n} className="flex gap-3 animate-pulse">
                    <div className="h-9 w-9 rounded-full bg-[#222222]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/4 rounded bg-[#222222]" />
                      <div className="h-3 w-3/4 rounded bg-[#222222]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="py-4 text-xs text-[#777777]">
                Chưa có bình luận nào trên video này.
              </div>
            ) : (
              <div className="flex flex-col gap-5 pt-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                          comment.authorName
                        )}`;
                      }}
                      className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                    />
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-white truncate">
                          {comment.authorName}
                        </span>
                        {comment.isAuthor && (
                          <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent text-[10px] font-bold">
                            Bạn
                          </span>
                        )}
                        <span className="text-[#888888]">
                          {formatTimeAgo(comment.publishedAt)}
                        </span>
                      </div>
                      <p
                        className="text-xs sm:text-sm text-[#DDDDDD] leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: comment.text }}
                      />
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#888888]">
                        <button className="flex items-center gap-1 hover:text-white transition-colors">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{comment.likes > 0 ? comment.likes : ''}</span>
                        </button>
                        <button className="hover:text-white transition-colors">
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        <button className="font-semibold hover:text-white transition-colors">
                          Trả lời
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT 1 COLUMN: LIVE RELATED VIDEOS & AI SUMMARY ================= */}
        <div className="flex flex-col gap-4">
          
          {/* Segmented Control Tabs */}
          <div className="flex items-center p-1 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <button
              onClick={() => setRightTab('related')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                rightTab === 'related'
                  ? 'bg-[#2A2A2A] text-white shadow'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Video Đề Xuất Liên Quan
            </button>
            <button
              onClick={() => setRightTab('summary')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                rightTab === 'summary'
                  ? 'bg-accent text-white shadow'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tóm Tắt AI</span>
            </button>
          </div>

          {/* AI SUMMARY PANEL */}
          {rightTab === 'summary' && (
            <div className="flex flex-col gap-4 rounded-2xl bg-[#181818] p-4 sm:p-5 border border-[#2B2B2B]">
              <div className="flex items-center justify-between gap-2 border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20 text-accent">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Tóm Tắt AI Video</h3>
                </div>

                {aiSummary && (
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#AAAAAA] hover:text-white transition-colors cursor-pointer"
                    title="Sao chép tóm tắt"
                  >
                    {summaryCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {!aiSummary && !isGeneratingSummary && (
                <div className="text-center py-8 px-2 flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#222222] text-accent mb-3 border border-[#303030]">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Trích Xuất Nội Dung Bằng AI
                  </h4>
                  <p className="text-xs text-[#888888] max-w-xs mb-5">
                    Tạo tóm tắt ngắn, 4 ý chính đắt giá và timeline các đoạn quan trọng.
                  </p>
                  <button
                    onClick={handleGenerateSummary}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover-bg-accent shadow-md shadow-[#FF5500]/25 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Tạo Tóm Tắt Ngay</span>
                  </button>
                </div>
              )}

              {isGeneratingSummary && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="text-xs font-medium text-[#AAAAAA]">
                    Đang phân tích video và trích xuất ý chính...
                  </p>
                </div>
              )}

              {aiSummary && !isGeneratingSummary && (
                <div className="flex flex-col gap-4 text-xs">
                  {/* TL;DR */}
                  <div className="rounded-xl bg-[#222222] p-3 border border-[#303030]">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-accent mb-1 block">
                      Tóm tắt nhanh (TL;DR)
                    </span>
                    <p className="text-[#E0E0E0] leading-relaxed">
                      {aiSummary.tldr}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div>
                    <span className="text-[11px] font-bold text-white mb-2 block">
                      Các Ý Chính Quan Trọng
                    </span>
                    <ul className="flex flex-col gap-2">
                      {aiSummary.keyTakeaways.map((point, index) => (
                        <li key={index} className="flex gap-2 text-[#CCCCCC] leading-normal">
                          <span className="text-accent font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chapters / Timeline */}
                  <div>
                    <span className="text-[11px] font-bold text-white mb-2 block">
                      Mốc Thời Gian (Nhấn để nhảy đến)
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {aiSummary.chapters.map((ch, idx) => (
                        <button
                          key={idx}
                          onClick={() => seekVideoTo(ch.seconds)}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-[#202020] hover:bg-[#282828] text-left transition-colors cursor-pointer group"
                        >
                          <span className="px-2 py-0.5 rounded bg-[#2D2D2D] group-hover:bg-accent text-accent group-hover:text-white font-mono text-[11px] font-semibold shrink-0 transition-colors">
                            {ch.timestamp}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-white text-xs truncate">
                              {ch.title}
                            </span>
                            <span className="text-[11px] text-[#888888] truncate">
                              {ch.summary}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actionable Verdict */}
                  <div className="rounded-xl bg-accent/10 border border-accent/25 p-3">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-accent mb-0.5 block">
                      Đánh Giá & Nhận Định
                    </span>
                    <p className="text-[#E0E0E0] text-[11px] leading-relaxed">
                      {aiSummary.actionableVerdict}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECOMMENDED / RELATED VIDEOS (FETCHED REAL TIME VIA YOUTUBE API) */}
          {(rightTab === 'related' || !aiSummary) && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white px-1">
                Video Đề Xuất Liên Quan
              </h3>

              {isLoadingRelated ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex gap-3 animate-pulse">
                      <div className="w-36 aspect-video rounded-lg bg-[#222222]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-5/6 rounded bg-[#222222]" />
                        <div className="h-2 w-1/2 rounded bg-[#222222]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : liveRelatedVideos.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#777777]">
                  Không tìm thấy video đề xuất tương tự.
                </div>
              ) : (
                liveRelatedVideos.map((relVideo) => (
                  <div
                    key={relVideo.id}
                    onClick={() => {
                      onSelectVideo(relVideo);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex gap-3 p-1.5 rounded-xl cursor-pointer hover:bg-[#1E1E1E] transition-colors group"
                  >
                    <div className="relative aspect-video w-36 sm:w-40 shrink-0 overflow-hidden rounded-lg bg-[#222222]">
                      <img
                        src={relVideo.thumbnails.medium || relVideo.thumbnails.default}
                        alt={relVideo.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute bottom-1 right-1 rounded bg-black/85 px-1 py-0.2 text-[10px] font-mono text-white">
                        {relVideo.duration}
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <h4 className="line-clamp-2 text-xs font-semibold text-white group-hover:text-accent transition-colors leading-snug">
                        {relVideo.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-[#888888] truncate">
                        {relVideo.channelTitle}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#777777]">
                        <span className="tabular-nums">{formatViews(relVideo.viewCount)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatTimeAgo(relVideo.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

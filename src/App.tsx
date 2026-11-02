/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CategoryChips } from './components/CategoryChips';
import { VideoGrid } from './components/VideoGrid';
import { WatchPage } from './components/WatchPage';
import { ChannelPage } from './components/ChannelPage';
import { SearchResults } from './components/SearchResults';
import { SettingsModal } from './components/SettingsModal';
import { CustomVideoModal } from './components/CustomVideoModal';
import { AddChannelModal } from './components/AddChannelModal';
import { LoginModal } from './components/LoginModal';
import { MiniPlayer } from './components/MiniPlayer';
import { VideoItem, ActiveView, AccentTheme, FollowedChannel, AuthUser } from './types';
import { INITIAL_ACCENT_COLORS } from './services/mockData';
import {
  fetchPopularFeed,
  fetchFollowedFeed,
  searchEverything,
  getApiStatus,
  ApiStatus,
} from './services/youtubeApi';
import {
  Tv2,
  History,
  Bookmark,
  ThumbsUp,
  Plus,
} from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<VideoItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('naotube_auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {
      username: 'qnnaot',
      displayName: 'qnnaot',
      email: 'qnnaot.pbe@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      isLoggedIn: true,
    };
  });

  const [isVercelLockActive, setIsVercelLockActive] = useState<boolean>(() => {
    return localStorage.getItem('naotube_vercel_lock') === 'true';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Followed channels state (persisted in localStorage)
  const [followedChannels, setFollowedChannels] = useState<FollowedChannel[]>(() => {
    try {
      const stored = localStorage.getItem('naotube_followed_channels');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  // Videos state: normal YouTube recommendations feed + followed feed
  const [feedVideos, setFeedVideos] = useState<VideoItem[]>([]);
  const [followedVideos, setFollowedVideos] = useState<VideoItem[]>([]);
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  const [searchChannelsList, setSearchChannelsList] = useState<FollowedChannel[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Local storage collections
  const [bookmarkedVideos, setBookmarkedVideos] = useState<VideoItem[]>([]);
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);
  const [historyVideos, setHistoryVideos] = useState<VideoItem[]>([]);

  // Theme Accent
  const [currentAccent, setCurrentAccent] = useState<AccentTheme>(() => {
    try {
      const savedTheme = localStorage.getItem('naotube_accent_theme');
      if (savedTheme) {
        return JSON.parse(savedTheme);
      }
    } catch {}
    return INITIAL_ACCENT_COLORS[0];
  });

  // API Status
  const [apiStatus, setApiStatus] = useState<ApiStatus>(getApiStatus());

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCustomVideoOpen, setIsCustomVideoOpen] = useState<boolean>(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState<boolean>(false);

  // Apply accent colors to root CSS variables
  const applyAccentTheme = (theme: AccentTheme) => {
    setCurrentAccent(theme);
    localStorage.setItem('naotube_accent_theme', JSON.stringify(theme));
    document.documentElement.style.setProperty('--accent-color', theme.hex);
    document.documentElement.style.setProperty('--accent-hover', theme.hoverHex);
    document.documentElement.style.setProperty('--accent-subtle', theme.subtleHex);
  };

  useEffect(() => {
    applyAccentTheme(currentAccent);

    try {
      const storedBookmarks = JSON.parse(localStorage.getItem('naotube_saved_videos') || '[]');
      setBookmarkedVideos(storedBookmarks);

      const storedLikes = JSON.parse(localStorage.getItem('naotube_liked_ids') || '[]');
      setLikedVideoIds(storedLikes);

      const storedHistory = JSON.parse(localStorage.getItem('naotube_history') || '[]');
      setHistoryVideos(storedHistory);
    } catch {}

    if (window.innerWidth < 1024) {
      setIsSidebarExpanded(false);
    }
  }, []);

  // Fetch standard YouTube feed across categories
  const loadFeed = useCallback(async (cat: string = selectedCategory) => {
    setIsLoadingFeed(true);
    try {
      const items = await fetchPopularFeed(cat);
      setFeedVideos(items);
      setApiStatus(getApiStatus());
    } catch (err) {
      console.warn('Error fetching YouTube feed:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadFeed(selectedCategory);
  }, [selectedCategory, loadFeed]);

  // Load followed channels feed
  const loadFollowedVideos = useCallback(async () => {
    if (followedChannels.length === 0) {
      setFollowedVideos([]);
      return;
    }
    try {
      const items = await fetchFollowedFeed(followedChannels);
      setFollowedVideos(items);
    } catch (err) {
      console.warn('Error loading followed videos:', err);
    }
  }, [followedChannels]);

  useEffect(() => {
    loadFollowedVideos();
  }, [loadFollowedVideos]);

  // Toggle follow/unfollow a channel
  const handleToggleFollowChannel = (channel: FollowedChannel) => {
    setFollowedChannels((prev) => {
      const exists = prev.some((c) => c.id === channel.id);
      let updated: FollowedChannel[];
      if (exists) {
        updated = prev.filter((c) => c.id !== channel.id);
      } else {
        updated = [channel, ...prev];
      }
      try {
        localStorage.setItem('naotube_followed_channels', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle Vercel Private Guard Lock
  const handleToggleVercelLock = (active: boolean) => {
    setIsVercelLockActive(active);
    localStorage.setItem('naotube_vercel_lock', active ? 'true' : 'false');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('naotube_auth_user');
  };

  // Handle Search (Searches both Channels and Videos)
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setActiveView('search');
    setIsSearching(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { channels, videos } = await searchEverything(query);
      setSearchChannelsList(channels);
      setSearchResults(videos);
    } catch (err) {
      console.warn('Search error:', err);
      setSearchResults([]);
      setSearchChannelsList([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Navigate to Channel Page
  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    setActiveView('channel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Video Selection (Watch Page)
  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setActiveView('watch');
    if (miniPlayerVideo?.id === video.id) {
      setMiniPlayerVideo(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Add to history
    setHistoryVideos((prev) => {
      const filtered = prev.filter((v) => v.id !== video.id);
      const updated = [video, ...filtered].slice(0, 50);
      try {
        localStorage.setItem('naotube_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Launch Mini Player
  const handleLaunchMiniPlayer = (video: VideoItem) => {
    setMiniPlayerVideo(video);
    setActiveView('home');
  };

  // Toggle Bookmark
  const handleToggleBookmark = (video: VideoItem) => {
    setBookmarkedVideos((prev) => {
      const exists = prev.some((v) => v.id === video.id);
      let updated: VideoItem[];
      if (exists) {
        updated = prev.filter((v) => v.id !== video.id);
      } else {
        updated = [video, ...prev];
      }
      try {
        localStorage.setItem('naotube_saved_videos', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Clear History
  const handleClearHistory = () => {
    setHistoryVideos([]);
    try {
      localStorage.removeItem('naotube_history');
    } catch {}
  };

  // Clear all notes
  const handleClearAllNotes = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('naotube_notes_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  };

  const bookmarkedSet = new Set(bookmarkedVideos.map((v) => v.id));

  // Determine what view to render
  const getDisplayContent = () => {
    // Channel Page View
    if (activeView === 'channel' && selectedChannelId) {
      return (
        <ChannelPage
          channelId={selectedChannelId}
          onSelectVideo={handleSelectVideo}
          onToggleBookmark={handleToggleBookmark}
          bookmarkedIds={bookmarkedSet}
          followedChannels={followedChannels}
          onToggleFollowChannel={handleToggleFollowChannel}
          onBack={() => setActiveView('home')}
        />
      );
    }

    // Video Watch Page View
    if (activeView === 'watch' && selectedVideo) {
      return (
        <WatchPage
          video={selectedVideo}
          onSelectVideo={handleSelectVideo}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={bookmarkedSet.has(selectedVideo.id)}
          onBackToHome={() => setActiveView('home')}
          followedChannels={followedChannels}
          onToggleFollowChannel={handleToggleFollowChannel}
          onLaunchMiniPlayer={handleLaunchMiniPlayer}
          onSelectChannel={handleSelectChannel}
        />
      );
    }

    // Search Results View
    if (activeView === 'search') {
      return (
        <SearchResults
          query={searchQuery}
          videos={searchResults}
          channels={searchChannelsList}
          isLoading={isSearching}
          onSelectVideo={handleSelectVideo}
          onSelectChannel={handleSelectChannel}
          onToggleBookmark={handleToggleBookmark}
          bookmarkedIds={bookmarkedSet}
          followedChannels={followedChannels}
          onToggleFollowChannel={handleToggleFollowChannel}
        />
      );
    }

    // Followed Channels View
    if (activeView === 'subscriptions') {
      return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#242424]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <Tv2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Video Từ Kênh Bạn Đang Follow</h1>
                <p className="text-xs text-[#888888]">{followedChannels.length} kênh trong danh sách theo dõi</p>
              </div>
            </div>

            <button
              onClick={() => setIsAddChannelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover-bg-accent shadow-md shadow-[#FF5500]/25 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tìm & Thêm Kênh</span>
            </button>
          </div>

          {followedChannels.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E1E1E] text-accent mb-4 border border-[#333333]">
                <Tv2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Chưa theo dõi kênh nào</h3>
              <p className="text-sm text-[#AAAAAA] max-w-md mb-6">
                Nhấn Thêm Kênh để theo dõi các kênh YouTube bạn yêu thích và cập nhật video mới nhất!
              </p>
              <button
                onClick={() => setIsAddChannelOpen(true)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-accent text-white hover-bg-accent transition-colors cursor-pointer"
              >
                + Thêm Kênh Follow Ngay
              </button>
            </div>
          ) : (
            <VideoGrid
              videos={followedVideos}
              isLoading={false}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedIds={bookmarkedSet}
              emptyMessage="Đang tải hoặc các kênh chưa có video mới."
            />
          )}
        </div>
      );
    }

    if (activeView === 'history') {
      return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242424]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Lịch Sử Xem Video</h1>
                <p className="text-xs text-[#888888]">{historyVideos.length} video đã xem</p>
              </div>
            </div>
            {historyVideos.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3.5 py-1.5 rounded-lg bg-[#222222] text-xs font-semibold text-[#CCCCCC] hover:text-white hover:bg-[#2C2C2C] transition-colors cursor-pointer"
              >
                Xóa Lịch Sử
              </button>
            )}
          </div>
          <VideoGrid
            videos={historyVideos}
            isLoading={false}
            onSelectVideo={handleSelectVideo}
            onSelectChannel={handleSelectChannel}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedSet}
            emptyMessage="Lịch sử xem của bạn đang trống. Hãy chọn video để bắt đầu thưởng thức."
          />
        </div>
      );
    }

    if (activeView === 'liked') {
      const likedVideos = feedVideos.filter((v) => likedVideoIds.includes(v.id));
      return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#242424]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Video Đã Thích</h1>
              <p className="text-xs text-[#888888]">{likedVideoIds.length} video đã thích</p>
            </div>
          </div>
          <VideoGrid
            videos={likedVideos.length > 0 ? likedVideos : feedVideos.slice(0, 4)}
            isLoading={false}
            onSelectVideo={handleSelectVideo}
            onSelectChannel={handleSelectChannel}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedSet}
            emptyMessage="Bạn chưa nhấn thích video nào. Bấm nút Like trên video để lưu vào đây."
          />
        </div>
      );
    }

    if (activeView === 'library') {
      return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#242424]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Bookmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Thư Viện Đã Lưu</h1>
              <p className="text-xs text-[#888888]">{bookmarkedVideos.length} video đã lưu</p>
            </div>
          </div>
          <VideoGrid
            videos={bookmarkedVideos}
            isLoading={false}
            onSelectVideo={handleSelectVideo}
            onSelectChannel={handleSelectChannel}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedSet}
            emptyMessage="Thư viện đang trống. Nhấn biểu tượng lưu trên bất kỳ video nào để xem lại sau."
          />
        </div>
      );
    }

    // Default: Normal YouTube Recommendations Feed
    return (
      <div className="flex flex-col flex-1 min-w-0">
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <VideoGrid
          videos={feedVideos}
          isLoading={isLoadingFeed}
          onSelectVideo={handleSelectVideo}
          onSelectChannel={handleSelectChannel}
          onToggleBookmark={handleToggleBookmark}
          bookmarkedIds={bookmarkedSet}
          emptyMessage="Đang tải các video đề xuất từ YouTube..."
          onResetFilter={() => setSelectedCategory('Tất cả')}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col antialiased">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onSearch={handleSearch}
        onHomeClick={() => {
          setActiveView('home');
          setSelectedCategory('Tất cả');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAddChannelModal={() => setIsAddChannelOpen(true)}
        onOpenCustomVideoModal={() => setIsCustomVideoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        apiStatus={apiStatus}
        currentAccent={currentAccent}
        onChangeAccent={applyAccentTheme}
        followedCount={followedChannels.length}
        currentUser={currentUser}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 min-w-0">
        {/* Collapsible Sidebar Navigation */}
        {activeView !== 'watch' ? (
          <Sidebar
            isExpanded={isSidebarExpanded}
            activeView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            followedChannels={followedChannels}
            savedCount={bookmarkedVideos.length}
            likedCount={likedVideoIds.length}
            historyCount={historyVideos.length}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAddChannelModal={() => setIsAddChannelOpen(true)}
            onSelectChannel={handleSelectChannel}
          />
        ) : (
          <div className="hidden 2xl:block">
            <Sidebar
              isExpanded={false}
              activeView={activeView}
              onNavigate={(view) => {
                setActiveView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              followedChannels={followedChannels}
              savedCount={bookmarkedVideos.length}
              likedCount={likedVideoIds.length}
              historyCount={historyVideos.length}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAddChannelModal={() => setIsAddChannelOpen(true)}
              onSelectChannel={handleSelectChannel}
            />
          </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {getDisplayContent()}
        </main>
      </div>

      {/* Floating Mini-Player when active */}
      {miniPlayerVideo && activeView !== 'watch' && (
        <MiniPlayer
          video={miniPlayerVideo}
          onMaximize={() => {
            handleSelectVideo(miniPlayerVideo);
            setMiniPlayerVideo(null);
          }}
          onClose={() => setMiniPlayerVideo(null)}
        />
      )}

      {/* Add / Follow Channel Modal */}
      <AddChannelModal
        isOpen={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
        followedChannels={followedChannels}
        onToggleFollow={handleToggleFollowChannel}
        onSelectChannel={handleSelectChannel}
      />

      {/* Login Modal (supports qnnaot / 123123) */}
      <LoginModal
        isOpen={isLoginModalOpen || (isVercelLockActive && !currentUser?.isLoggedIn)}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
        }}
        isMandatoryLock={isVercelLockActive && !currentUser?.isLoggedIn}
      />

      {/* Platform Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentAccent={currentAccent}
        onChangeAccent={applyAccentTheme}
        onClearHistory={handleClearHistory}
        onClearAllNotes={handleClearAllNotes}
        onRefreshFeed={() => loadFeed(selectedCategory)}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isVercelLockActive={isVercelLockActive}
        onToggleVercelLock={handleToggleVercelLock}
      />

      {/* Custom Video Loader Modal */}
      <CustomVideoModal
        isOpen={isCustomVideoOpen}
        onClose={() => setIsCustomVideoOpen(false)}
        onLoadVideo={(customVid) => {
          handleSelectVideo(customVid);
        }}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VideoItem, CommentItem, FollowedChannel } from '../types';
import {
  formatISODuration,
  parseDurationToSeconds,
} from './mockData';

/* ==========================================================================
   NAOTUBE - YOUTUBE DATA API v3 INTEGRATION
   ========================================================================== */
export let YOUTUBE_API_KEY: string = 'AIzaSyCjNTwFqng_Wjb8jDAjIZm-CJU4TPt5DRk';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Cache for channel details
const channelCache: Record<string, FollowedChannel> = {};

export function getActiveApiKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('naotube_yt_api_key');
    if (stored && stored.trim()) return stored.trim();
  }
  const envKey = (import.meta as any).env?.VITE_YOUTUBE_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return YOUTUBE_API_KEY.trim();
}

export function setActiveApiKey(key: string): void {
  YOUTUBE_API_KEY = key.trim();
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('naotube_yt_api_key', key.trim());
    } else {
      localStorage.removeItem('naotube_yt_api_key');
    }
  }
}

export interface ApiStatus {
  isConfigured: boolean;
  statusMessage: string;
}

export function getApiStatus(): ApiStatus {
  const key = getActiveApiKey();
  return {
    isConfigured: !!key,
    statusMessage: key ? 'Live YouTube Data API v3 Active' : 'Chưa có API Key',
  };
}

/**
 * Test API key against YouTube Data API
 */
export async function testApiKey(keyToTest: string): Promise<{ success: boolean; message: string }> {
  if (!keyToTest || !keyToTest.trim()) {
    return { success: false, message: 'API key cannot be empty' };
  }
  try {
    const res = await fetch(
      `${BASE_URL}/videos?part=snippet&chart=mostPopular&maxResults=1&key=${encodeURIComponent(keyToTest.trim())}`
    );
    const data = await res.json();
    if (!res.ok) {
      const errorReason = data.error?.errors?.[0]?.reason || data.error?.message || 'API request failed';
      return { success: false, message: `YouTube API Error: ${errorReason}` };
    }
    return { success: true, message: 'YouTube Data API v3 key verified successfully!' };
  } catch (err: any) {
    return { success: false, message: `Network error: ${err.message || 'Could not reach Google APIs'}` };
  }
}

/**
 * Fetch popular / normal YouTube feed across categories
 */
export async function fetchPopularFeed(category: string = 'Tất cả'): Promise<VideoItem[]> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return [];

  try {
    if (category === 'Tất cả' || category === 'Thịnh hành' || category === 'All') {
      const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=VN&maxResults=24&key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.items || data.items.length === 0) {
        const fallbackUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=US&maxResults=24&key=${encodeURIComponent(apiKey)}`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.items) {
          return mapVideoItems(fallbackData.items, 'Tất cả');
        }
        return [];
      }

      return mapVideoItems(data.items, category);
    }

    const categoryQueryMap: Record<string, string> = {
      'Âm nhạc': 'official music video bài hát hay nhất',
      'Gaming': 'gaming highlight gameplay playthrough',
      'Công nghệ': 'công nghệ smartphone AI laptop review',
      'Lập trình': 'lập trình code web python javascript',
      'Khoa học': 'khoa học khám phá vũ trụ bí ẩn',
      'Tin tức': 'tin tức mới nhất thời sự thế giới',
      'Podcast': 'podcast trò chuyện chia sẻ',
      'Giải trí': 'hài hước giải trí show',
    };

    const query = categoryQueryMap[category] || category;
    return await searchVideos(query, 24);
  } catch (err) {
    console.error('fetchPopularFeed error:', err);
    return [];
  }
}

/**
 * Search YouTube channels by name, handle, or keyword
 */
export async function searchChannels(query: string): Promise<FollowedChannel[]> {
  const apiKey = getActiveApiKey();
  if (!apiKey || !query.trim()) return [];

  try {
    const res = await fetch(
      `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query.trim())}&maxResults=6&key=${encodeURIComponent(apiKey)}`
    );
    const data = await res.json();
    if (!res.ok || !data.items) return [];

    const channelIds = data.items.map((it: any) => it.id?.channelId).filter(Boolean);
    if (channelIds.length === 0) return [];

    const statsRes = await fetch(
      `${BASE_URL}/channels?part=snippet,brandingSettings,statistics&id=${channelIds.join(',')}&key=${encodeURIComponent(apiKey)}`
    );
    const statsData = await statsRes.json();

    if (!statsRes.ok || !statsData.items) {
      return data.items.map((it: any) => ({
        id: it.id.channelId,
        title: it.snippet.title,
        handle: it.snippet.customUrl || '',
        avatar: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.default?.url || '',
        description: it.snippet.description || '',
      }));
    }

    return statsData.items.map((it: any) => ({
      id: it.id,
      title: it.snippet.title,
      handle: it.snippet.customUrl || '',
      avatar: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.default?.url || '',
      banner: it.brandingSettings?.image?.bannerExternalUrl || '',
      subscriberCount: formatSubscriberCount(it.statistics?.subscriberCount || '0'),
      videoCount: it.statistics?.videoCount ? `${parseInt(it.statistics.videoCount, 10).toLocaleString()} videos` : '',
      totalViews: it.statistics?.viewCount ? `${parseInt(it.statistics.viewCount, 10).toLocaleString()} views` : '',
      joinedDate: it.snippet.publishedAt || '',
      description: it.snippet.description || '',
    }));
  } catch (err) {
    console.error('searchChannels error:', err);
    return [];
  }
}

/**
 * Fetch complete channel details by channel ID
 */
export async function fetchChannelDetails(channelId: string): Promise<FollowedChannel | null> {
  if (channelCache[channelId] && channelCache[channelId].banner !== undefined) {
    return channelCache[channelId];
  }

  const apiKey = getActiveApiKey();
  if (!apiKey) return null;

  try {
    const url = `${BASE_URL}/channels?part=snippet,brandingSettings,statistics&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok && data.items && data.items[0]) {
      const it = data.items[0];
      const channel: FollowedChannel = {
        id: it.id,
        title: it.snippet.title,
        handle: it.snippet.customUrl || `@${it.snippet.title.toLowerCase().replace(/\s+/g, '')}`,
        avatar: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.default?.url || '',
        banner: it.brandingSettings?.image?.bannerExternalUrl || '',
        subscriberCount: formatSubscriberCount(it.statistics?.subscriberCount || '0'),
        videoCount: it.statistics?.videoCount ? `${parseInt(it.statistics.videoCount, 10).toLocaleString()} video` : '',
        totalViews: it.statistics?.viewCount ? `${parseInt(it.statistics.viewCount, 10).toLocaleString()} lượt xem` : '',
        joinedDate: it.snippet.publishedAt ? new Date(it.snippet.publishedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
        description: it.snippet.description || '',
      };
      channelCache[channelId] = channel;
      return channel;
    }
  } catch (err) {
    console.warn('Channel details fetch error:', err);
  }
  return null;
}

/**
 * Fetch videos from a specific channel with sorting
 */
export async function fetchChannelVideos(
  channelId: string,
  order: 'date' | 'viewCount' = 'date',
  maxResults = 24
): Promise<VideoItem[]> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return [];

  try {
    const searchUrl = `${BASE_URL}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=${order}&type=video&maxResults=${maxResults}&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!res.ok || !data.items || data.items.length === 0) return [];

    const videoIds = data.items.map((it: any) => it.id?.videoId).filter(Boolean).join(',');
    if (!videoIds) return [];

    const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${encodeURIComponent(apiKey)}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (!detailsRes.ok || !detailsData.items) return [];

    return mapVideoItems(detailsData.items, 'Kênh');
  } catch (err) {
    console.warn(`Error fetching videos for channel ${channelId}:`, err);
    return [];
  }
}

/**
 * Search both channels and videos simultaneously (YouTube style)
 */
export async function searchEverything(query: string): Promise<{ channels: FollowedChannel[]; videos: VideoItem[] }> {
  const [channels, videos] = await Promise.all([
    searchChannels(query),
    searchVideos(query, 24),
  ]);
  return { channels, videos };
}

/**
 * Fetch feed for all followed channels
 */
export async function fetchFollowedFeed(followedChannels: FollowedChannel[]): Promise<VideoItem[]> {
  if (!followedChannels || followedChannels.length === 0) return [];

  const apiKey = getActiveApiKey();
  if (!apiKey) return [];

  try {
    const channelsToFetch = followedChannels.slice(0, 10);
    const promises = channelsToFetch.map((ch) =>
      fetchChannelVideos(ch.id, 'date', 4).then((vids) =>
        vids.map((v) => ({ ...v, channelAvatar: ch.avatar || v.channelAvatar }))
      )
    );

    const results = await Promise.all(promises);
    return results.flat().sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  } catch (err) {
    console.error('Error fetching followed feed:', err);
    return [];
  }
}

/**
 * Fetch related videos for a given video
 */
export async function fetchRelatedVideos(
  videoId: string,
  title: string,
  channelTitle?: string
): Promise<VideoItem[]> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return [];

  try {
    const cleanWords = title
      .replace(/[^\w\s]/gi, ' ')
      .split(' ')
      .filter((w) => w.length > 3)
      .slice(0, 4)
      .join(' ');

    const query = cleanWords || channelTitle || 'youtube video';
    const videos = await searchVideos(query, 12);
    return videos.filter((v) => v.id !== videoId);
  } catch (err) {
    console.warn('Error fetching related videos:', err);
    return [];
  }
}

/**
 * Search videos by query keyword
 */
export async function searchVideos(query: string, maxResults = 24): Promise<VideoItem[]> {
  const apiKey = getActiveApiKey();
  if (!apiKey || !query.trim()) return [];

  try {
    const searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
      query.trim()
    )}&type=video&maxResults=${maxResults}&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!res.ok || !data.items) {
      console.warn('YouTube search API error:', data.error);
      return [];
    }

    const videoIds = data.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) return [];

    const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${encodeURIComponent(
      apiKey
    )}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (!detailsRes.ok || !detailsData.items) return [];

    return mapVideoItems(detailsData.items, 'Tìm Kiếm');
  } catch (err) {
    console.warn('Search fetch error:', err);
    return [];
  }
}

/**
 * Fetch video details for single video ID
 */
export async function fetchVideoDetails(videoId: string): Promise<VideoItem | null> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return null;

  try {
    const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(
      videoId
    )}&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.items || data.items.length === 0) {
      return null;
    }

    const item = data.items[0];
    const durationStr = formatISODuration(item.contentDetails?.duration || 'PT0S');
    const durationSec = parseDurationToSeconds(item.contentDetails?.duration || 'PT0S');

    const video: VideoItem = {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      channelAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.snippet.channelTitle)}`,
      publishedAt: item.snippet.publishedAt,
      duration: durationStr,
      durationSeconds: durationSec,
      viewCount: item.statistics?.viewCount || '0',
      likeCount: item.statistics?.likeCount || '0',
      category: 'General',
      tags: item.snippet.tags || [],
      thumbnails: {
        default: item.snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${item.id}/default.jpg`,
        medium: item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`,
        high: item.snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
        maxres: item.snippet.thumbnails?.maxres?.url || `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
      },
    };

    const channelInfo = await fetchChannelDetails(item.snippet.channelId);
    if (channelInfo) {
      video.channelAvatar = channelInfo.avatar;
      video.subscriberCount = channelInfo.subscriberCount;
    }

    return video;
  } catch (err) {
    console.warn('Error fetching video details:', err);
    return null;
  }
}

/**
 * Fetch comments for a video
 */
export async function fetchVideoComments(videoId: string): Promise<CommentItem[]> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return [];

  try {
    const url = `${BASE_URL}/commentThreads?part=snippet&videoId=${encodeURIComponent(
      videoId
    )}&maxResults=20&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.items) {
      return [];
    }

    return data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        authorName: snippet.authorDisplayName,
        authorAvatar: snippet.authorProfileImageUrl,
        text: snippet.textDisplay,
        publishedAt: snippet.publishedAt,
        likes: snippet.likeCount || 0,
      };
    });
  } catch (err) {
    console.warn('Error fetching comments:', err);
    return [];
  }
}

function mapVideoItems(rawItems: any[], category: string): VideoItem[] {
  return rawItems.map((item: any) => {
    const durationStr = formatISODuration(item.contentDetails?.duration || 'PT0S');
    const durationSec = parseDurationToSeconds(item.contentDetails?.duration || 'PT0S');
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      channelAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.snippet.channelTitle)}`,
      publishedAt: item.snippet.publishedAt,
      duration: durationStr,
      durationSeconds: durationSec,
      viewCount: item.statistics?.viewCount || '0',
      likeCount: item.statistics?.likeCount || '0',
      category: category,
      tags: item.snippet.tags || [],
      thumbnails: {
        default: item.snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${item.id}/default.jpg`,
        medium: item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`,
        high: item.snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
        maxres: item.snippet.thumbnails?.maxres?.url || `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
      },
    };
  });
}

function formatSubscriberCount(count: string | number): string {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;
  if (isNaN(num) || num === 0) return '100K';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + ' Tr';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + ' N';
  }
  return `${num}`;
}

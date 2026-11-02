/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  channelAvatar: string;
  publishedAt: string;
  duration: string;
  durationSeconds?: number;
  viewCount: string;
  likeCount: string;
  subscriberCount?: string;
  category: string;
  tags?: string[];
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxres?: string;
  };
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  publishedAt: string;
  likes: number;
  userLiked?: boolean;
  isAuthor?: boolean;
}

export interface BookmarkNote {
  id: string;
  videoId: string;
  timestampSeconds: number;
  timestampFormatted: string;
  note: string;
  createdAt: string;
}

export interface AccentTheme {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
  subtleHex: string;
}

export interface FollowedChannel {
  id: string;
  title: string;
  handle?: string;
  avatar: string;
  banner?: string;
  subscriberCount?: string;
  videoCount?: string;
  totalViews?: string;
  joinedDate?: string;
  description?: string;
  followedAt?: string;
}

export interface AuthUser {
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export type ActiveView = 
  | 'home' 
  | 'watch' 
  | 'search' 
  | 'channel'
  | 'subscriptions' 
  | 'history' 
  | 'liked' 
  | 'library' 
  | 'settings';

export interface AISummaryData {
  tldr: string;
  keyTakeaways: string[];
  chapters: {
    timestamp: string;
    seconds: number;
    title: string;
    summary: string;
  }[];
  actionableVerdict: string;
}

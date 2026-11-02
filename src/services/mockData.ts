/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const INITIAL_ACCENT_COLORS = [
  {
    id: 'orange-vivid',
    name: 'Vivid Flame',
    hex: '#FF5500',
    hoverHex: '#FF6A1A',
    subtleHex: 'rgba(255, 85, 0, 0.15)',
  },
  {
    id: 'orange-neon',
    name: 'Neon Tangerine',
    hex: '#FF6600',
    hoverHex: '#FF7A1A',
    subtleHex: 'rgba(255, 102, 0, 0.15)',
  },
  {
    id: 'orange-amber',
    name: 'Electric Amber',
    hex: '#FFA000',
    hoverHex: '#FFB300',
    subtleHex: 'rgba(255, 160, 0, 0.15)',
  },
  {
    id: 'orange-sunset',
    name: 'Sunset Crimson',
    hex: '#FF3D00',
    hoverHex: '#FF5722',
    subtleHex: 'rgba(255, 61, 0, 0.15)',
  },
  {
    id: 'orange-gold',
    name: 'Molten Gold',
    hex: '#FF8800',
    hoverHex: '#FF9E1B',
    subtleHex: 'rgba(255, 136, 0, 0.15)',
  },
];

export const CATEGORIES = [
  'Tất cả',
  'Thịnh hành',
  'Âm nhạc',
  'Gaming',
  'Công nghệ',
  'Lập trình',
  'Khoa học',
  'Tin tức',
  'Podcast',
  'Giải trí',
];

/**
 * Utility functions for formatting YouTube data
 */
export function formatViews(views: string | number): string {
  const num = typeof views === 'string' ? parseInt(views, 10) : views;
  if (isNaN(num)) return '0 lượt xem';
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' tỷ lượt xem';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' Tr lượt xem';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + ' N lượt xem';
  }
  return `${num} lượt xem`;
}

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} năm trước`;
}

export function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  if (duration.startsWith('PT')) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }
  const parts = duration.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function formatSecondsToTime(seconds: number): string {
  const sec = Math.floor(Math.max(0, seconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatISODuration(iso: string): string {
  if (!iso || !iso.startsWith('PT')) return iso || '00:00';
  const sec = parseDurationToSeconds(iso);
  return formatSecondsToTime(sec);
}

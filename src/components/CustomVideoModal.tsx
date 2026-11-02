/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Play, Link as LinkIcon, Film, Sparkles } from 'lucide-react';
import { VideoItem } from '../types';
import { fetchVideoDetails } from '../services/youtubeApi';

interface CustomVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadVideo: (video: VideoItem) => void;
}

export const CustomVideoModal: React.FC<CustomVideoModalProps> = ({
  isOpen,
  onClose,
  onLoadVideo,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [extractedId, setExtractedId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Extracts YouTube video ID from various formats
  const parseYouTubeId = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Check if raw 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    // Match youtube.com/watch?v=...
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch && vMatch[1]) return vMatch[1];

    // Match youtu.be/...
    const beMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (beMatch && beMatch[1]) return beMatch[1];

    // Match youtube.com/embed/...
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    return null;
  };

  const handleInputChange = (val: string) => {
    setUrlInput(val);
    setError('');
    const id = parseYouTubeId(val);
    setExtractedId(id || '');
  };

  const handlePlay = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseYouTubeId(urlInput);
    if (!id) {
      setError('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...) or 11-character video ID.');
      return;
    }

    setIsLoading(true);
    try {
      const details = await fetchVideoDetails(id);
      if (details) {
        onLoadVideo(details);
        onClose();
        setUrlInput('');
        setExtractedId('');
      } else {
        // Fallback default item
        const fallback: VideoItem = {
          id,
          title: `YouTube Video (${id})`,
          description: 'Loaded via custom link into OrangeTube player.',
          channelId: 'custom',
          channelTitle: 'YouTube Creator',
          channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
          publishedAt: new Date().toISOString(),
          duration: '10:00',
          durationSeconds: 600,
          viewCount: '100000',
          likeCount: '5000',
          category: 'Custom',
          thumbnails: {
            default: `https://i.ytimg.com/vi/${id}/default.jpg`,
            medium: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
            high: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            maxres: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          },
        };
        onLoadVideo(fallback);
        onClose();
      }
    } catch (err) {
      setError('Failed to load video details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#181818] border border-[#2E2E2E] shadow-2xl p-6 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A] mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
              <Film className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">Load YouTube Video</h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-[#252525] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-[#888888] mb-4 leading-relaxed">
          Paste any YouTube video link or raw video ID. It will load instantly inside OrangeTube with timestamp note-taking and AI summary generation!
        </p>

        <form onSubmit={handlePlay} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=... or ID"
              value={urlInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full rounded-xl bg-[#121212] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-[#666666] border border-[#333333] focus:border-accent focus:outline-none transition-colors"
              autoFocus
            />
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777777]" />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          {/* Thumbnail preview if ID identified */}
          {extractedId && (
            <div className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-[#202020] border border-[#2B2B2B]">
              <img
                src={`https://i.ytimg.com/vi/${extractedId}/mqdefault.jpg`}
                alt="Preview"
                className="w-24 aspect-video rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white">Video ID detected:</span>
                <span className="font-mono text-xs text-accent truncate">{extractedId}</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#AAAAAA] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !extractedId}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-accent text-white hover-bg-accent disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#FF5500]/25 transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isLoading ? 'Loading...' : 'Watch Now'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

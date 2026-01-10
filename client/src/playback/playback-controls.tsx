// ============================================================================
// PREMIUM PLAYBACK CONTROLS
// User interface for scrubbing, speed control, and navigation
// ============================================================================

import React, { useState } from 'react';
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Settings,
  Gauge
} from 'lucide-react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: Date;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void; // Relative seek
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onSyncToLive?: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  playbackSpeed,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onVolumeChange,
  onToggleMute,
  onSyncToLive,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedOptions = [0.25, 0.5, 1, 2, 4, 8, 16];

  return (
    <div className="flex flex-col gap-2 p-3 bg-dark-900/80 backdrop-blur-xl border-t border-white/5 shadow-inner">
      <div className="flex items-center justify-between px-2">
        {/* Left Section: Volume & Audio */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition-all ${isMuted || volume === 0 ? 'text-red-400 bg-red-500/10' : 'text-dark-300 hover:text-white hover:bg-white/10'}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="flex items-center group w-24 px-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 accent-primary-500 bg-dark-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Center Section: Main Playback Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/5">
            <button
              onClick={() => onSeek(-60)}
              className="p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
              title="Back 1 minute"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => onSeek(-10)}
              className="p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
              title="Back 10 seconds"
            >
              <Rewind size={18} />
            </button>

            <button
              onClick={onPlayPause}
              className={`mx-2 w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90 shadow-lg ${isPlaying
                  ? 'bg-red-500 text-white shadow-red-500/40'
                  : 'bg-primary-600 text-white shadow-primary-500/40'
                }`}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <button
              onClick={() => onSeek(10)}
              className="p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
              title="Forward 10 seconds"
            >
              <FastForward size={18} />
            </button>
            <button
              onClick={() => onSeek(60)}
              className="p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
              title="Forward 1 minute"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>

        {/* Right Section: Speed & Live */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-black/40 hover:bg-white/5 rounded-xl border border-white/5 transition-all group"
            >
              <Gauge size={16} className="text-primary-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black text-white">{playbackSpeed}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-3 w-32 bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="px-3 py-1 mb-1 border-b border-white/5">
                  <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Speed</span>
                </div>
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      onSpeedChange(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-xs text-left transition-all flex items-center justify-between ${playbackSpeed === speed
                        ? 'bg-primary-500 text-white'
                        : 'text-dark-300 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <span>{speed}x</span>
                    {playbackSpeed === speed && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onSyncToLive}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold rounded-xl border border-red-500/20 transition-all uppercase tracking-widest active:scale-95"
          >
            Live
          </button>
        </div>
      </div>
    </div>
  );
};

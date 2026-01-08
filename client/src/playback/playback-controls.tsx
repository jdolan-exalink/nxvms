import React, { useState } from 'react';
import { Play, Pause, FastForward, Rewind, Volume2, VolumeX } from 'lucide-react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onRewind: (seconds: number) => void;
  onFastForward: (seconds: number) => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onSeek: (time: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  volume,
  isMuted,
  onPlayPause,
  onRewind,
  onFastForward,
  onSpeedChange,
  onVolumeChange,
  onToggleMute,
  onSeek,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onSeek(percentage * duration);
  };

  return (
    <div className="w-full bg-dark-900 rounded-lg p-4 space-y-3">
      {/* Progress bar */}
      <div
        className="w-full h-2 bg-dark-700 rounded-full cursor-pointer group hover:h-3 transition-all"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-dark-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          {/* Rewind button */}
          <button
            onClick={() => onRewind(10)}
            className="p-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400"
            title="Rewind 10s"
          >
            <Rewind className="w-5 h-5" />
          </button>

          {/* Play/Pause button */}
          <button
            onClick={onPlayPause}
            className="p-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Fast forward button */}
          <button
            onClick={() => onFastForward(10)}
            className="p-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400"
            title="Fast forward 10s"
          >
            <FastForward className="w-5 h-5" />
          </button>

          {/* Volume controls */}
          <div className="flex items-center gap-2 border-l border-dark-700 pl-2 ml-2">
            <button
              onClick={onToggleMute}
              className="p-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1 accent-primary-500"
              title="Volume"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-3 py-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400 text-sm font-medium"
              title="Playback speed"
            >
              {playbackSpeed}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-dark-800 rounded border border-dark-700 py-1 z-50">
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      onSpeedChange(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-dark-700 transition-colors ${
                      playbackSpeed === speed
                        ? 'text-primary-400 font-medium'
                        : 'text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VIDEO PLAYER
// Unified video player supporting WebRTC, HLS, DASH, and RTSP
// ============================================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Camera as CameraIcon,
  Download,
  Settings,
  X,
} from 'lucide-react';
import Hls from 'hls.js';
import { StreamType, Camera } from '../shared/types';
import { PTZControls } from './ptz-controls';
import { DigitalZoom } from './digital-zoom';

interface VideoPlayerProps {
  camera: Camera;
  streamUrl: string;
  streamType: StreamType;
  autoplay?: boolean;
  muted?: boolean;
  showPTZ?: boolean;
  onSnapshot?: () => void;
  onFullscreen?: () => void;
  onSettings?: () => void;
  onPtzControl?: (action: string, params?: any) => Promise<void>;
  onTakeSnapshot?: (snapshotData: Blob) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  camera,
  streamUrl,
  streamType,
  autoplay = true,
  muted = false,
  onSnapshot,
  onFullscreen,
  onSettings,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize stream based on type
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasError(false);
    setIsLoading(true);

    const cleanup = () => {
      setIsLoading(false);
    };

    switch (streamType) {
      case StreamType.HLS:
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (autoplay) video.play().catch(console.error);
          });
          hls.on(Hls.Events.ERROR, () => {
            setHasError(true);
            setIsLoading(false);
          });
          return () => {
            hls.destroy();
            cleanup();
          };
        } else {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            if (autoplay) video.play().catch(console.error);
          });
          video.addEventListener('error', () => {
            setHasError(true);
            setIsLoading(false);
          });
          return cleanup;
        }

      case StreamType.DASH:
        // DASH implementation would use dash.js
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoplay) video.play().catch(console.error);
        });
        video.addEventListener('error', () => {
          setHasError(true);
          setIsLoading(false);
        });
        return cleanup;

      case StreamType.WEBRTC:
        // WebRTC implementation would use peer connection
        video.srcObject = null; // Would set to MediaStream
        setIsLoading(false);
        return cleanup;

      case StreamType.RTSP:
        // RTSP would use a proxy or specialized player
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoplay) video.play().catch(console.error);
        });
        video.addEventListener('error', () => {
          setHasError(true);
          setIsLoading(false);
        });
        return cleanup;

      default:
        setHasError(true);
        setIsLoading(false);
        return cleanup;
    }
  }, [streamUrl, streamType, autoplay]);

  // Update play state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!video.muted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch(console.error);
    }
  }, []);

  const handleSnapshot = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Draw video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to create snapshot blob');

        // Call onTakeSnapshot callback if provided
        if (props.onTakeSnapshot) {
          props.onTakeSnapshot(blob);
        }

        // Download snapshot
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot-${camera.name}-${new Date().toISOString().split('T')[0]}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Snapshot failed:', error);
    }
  }, [camera.name, props]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <CameraIcon className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-white text-sm">Failed to load stream</p>
          <p className="text-dark-400 text-xs mt-1">{streamType.toUpperCase()}</p>
        </div>
      )}

      {/* PTZ and Digital Zoom Controls (Top Right) */}
      {props.showPTZ && (
        <div className="absolute top-4 right-4 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DigitalZoom
            minZoom={1}
            maxZoom={4}
            initialZoom={1}
            onZoomChange={(zoom) => {
              // Handle zoom change - update video CSS transform
              if (videoRef.current) {
                videoRef.current.style.transform = `scale(${zoom})`;
              }
            }}
          />
          {camera.capabilities?.ptz && (
            <PTZControls
              cameraId={camera.id}
              isEnabled={isPlaying}
              onPtzControl={props.onPtzControl || (() => Promise.resolve())}
              presets={[]}
              onPresetSelect={(preset) => {
                props.onPtzControl?.('preset', { presetId: preset });
              }}
            />
          )}
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer">
          <div
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1 text-white hover:text-primary-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 text-white hover:text-primary-400 transition-colors"
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
                onChange={handleVolumeChange}
                className="w-20 h-1 accent-primary-500"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Snapshot */}
            <button
              onClick={handleSnapshot}
              className="p-1 text-white hover:text-primary-400 transition-colors"
              title="Take snapshot"
              disabled={!videoRef.current}
            >
              <CameraIcon className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={onFullscreen || handleFullscreen}
              className="p-1 text-white hover:text-primary-400 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>

            {/* Settings */}
            {onSettings && (
              <button
                onClick={onSettings}
                className="p-1 text-white hover:text-primary-400 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Name Overlay */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
        {camera.name}
      </div>

      {/* Recording Indicator */}
      {camera.status === 'recording' && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-500 font-medium">REC</span>
        </div>
      )}
    </div>
  );
};

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
  Settings,
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

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const {
    camera,
    streamUrl,
    streamType,
    autoplay = true,
    muted = false,
    onFullscreen,
    onSettings,
  } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Digital Zoom State
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Sync muted prop with local state
  useEffect(() => {
    const hasAudio = camera.capabilities?.audio !== false;
    const shouldMute = !hasAudio || muted;

    console.log(`[VIDEO] ${camera.name} - Muted: ${shouldMute}, HasAudio: ${hasAudio}, PropMuted: ${muted}`);

    setIsMuted(shouldMute);
    setVolume(shouldMute ? 0 : 1);

    const video = videoRef.current;
    if (video) {
      video.muted = shouldMute;
      video.volume = shouldMute ? 0 : 1;

      // If we are unmuting (meaning it has audio and is requested), try to play
      if (!shouldMute) {
        video.play().catch(() => {
          console.log('Autoplay unmuted blocked by policy');
        });
      }
    }
  }, [muted, camera.capabilities?.audio]);

  // Handle Wheel Zoom (Non-passive listener)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // Allow browser default zoom with ctrl

      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = -e.deltaY;

      setZoom(prevZoom => {
        const zoomStep = prevZoom >= 2 ? 0.8 : 0.4;
        const nextZoom = Math.min(Math.max(1, prevZoom + (delta > 0 ? zoomStep : -zoomStep)), 8);

        if (nextZoom === prevZoom) return prevZoom;

        setPosition(prevPos => {
          if (nextZoom === 1) return { x: 0, y: 0 };

          const scaleFactor = nextZoom / prevZoom;
          const newX = mouseX - (mouseX - prevPos.x) * scaleFactor;
          const newY = mouseY - (mouseY - prevPos.y) * scaleFactor;

          return { x: newX, y: newY };
        });

        return nextZoom;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

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
      case StreamType.FRIGATE_MSE:
        // RTSP or Frigate MSE would use a proxy or specialized player
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

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);

    // Default to full volume when unmuting if it was at 0
    if (!newMuted && volume === 0) {
      video.volume = 1;
      setVolume(1);
    } else if (newMuted) {
      video.volume = 0;
      setVolume(0);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    const newMuted = newVolume === 0;

    video.volume = newVolume;
    video.muted = newMuted;
    setVolume(newVolume);
    setIsMuted(newMuted);
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Limits to prevent dragging the image out of the container
    const minX = rect.width * (1 - zoom);
    const minY = rect.height * (1 - zoom);

    setPosition({
      x: Math.max(minX, Math.min(0, newX)),
      y: Math.max(minY, Math.min(0, newY))
    });
  }, [isDragging, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black group overflow-hidden ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-fill transition-transform duration-75 select-none pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
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
            maxZoom={8}
            initialZoom={zoom}
            onZoomChange={(newZoom) => {
              setZoom(newZoom);
              if (newZoom === 1) setPosition({ x: 0, y: 0 });
            }}
          />
          {camera.capabilities?.ptz && (
            <PTZControls
              cameraId={camera.id}
              isEnabled={isPlaying}
              onPtzControl={props.onPtzControl || (() => Promise.resolve())}
              presets={[]}
              onPresetSelect={async (preset) => {
                await props.onPtzControl?.('preset', { presetId: preset });
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
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
        {camera.name}
        {!isMuted && <Volume2 className="w-3 h-3 text-primary-400 animate-pulse" />}
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

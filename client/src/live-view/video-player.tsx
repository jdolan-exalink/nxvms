// ============================================================================
// VIDEO PLAYER
// Unified video player supporting WebRTC, HLS, DASH, and RTSP with premium UI
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
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Hls from 'hls.js';
import { StreamType, Camera } from '../shared/types';
import { PTZControls } from './ptz-controls';
import { DigitalZoom } from './digital-zoom';
import { getApiClient } from '../shared/api-client';
import { MetadataOverlay } from './MetadataOverlay';

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
  detections?: any[];
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

  // Snapshot flash effect
  const [showFlash, setShowFlash] = useState(false);

  // PTZ Presets state
  const [presets, setPresets] = useState<Array<{ id: string; name: string }>>([]);

  // Digital Zoom State
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Load PTZ Presets if enabled
  useEffect(() => {
    if (props.showPTZ && camera.capabilities?.ptz) {
      const fetchPresets = async () => {
        try {
          const api = getApiClient();
          const ptzPresets = await api.getPtzPresets(camera.id);
          setPresets(ptzPresets.map((p: any) => ({ id: p.id || p.token, name: p.name })));
        } catch (error) {
          console.error('Failed to fetch PTZ presets:', error);
        }
      };
      fetchPresets();
    }
  }, [camera.id, camera.capabilities?.ptz, props.showPTZ]);

  // Sync muted prop with local state
  useEffect(() => {
    const hasAudio = camera.capabilities?.audio !== false;
    const shouldMute = !hasAudio || muted;

    setIsMuted(shouldMute);
    setVolume(shouldMute ? 0 : 1);

    const video = videoRef.current;
    if (video) {
      video.muted = shouldMute;
      video.volume = shouldMute ? 0 : 1;
    }
  }, [muted, camera.capabilities?.audio]);

  // Handle Wheel Zoom (Non-passive listener)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;

      e.preventDefault();
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

  const [retryCount, setRetryCount] = useState(0);

  // Initialize stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasError(false);
    setIsLoading(true);

    const cleanup = () => {
      setIsLoading(false);
    };

    let retryTimeout: NodeJS.Timeout;

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      // Auto-retry every 5 seconds if there's an error
      retryTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 5000);
    };

    switch (streamType) {
      case StreamType.HLS:
        if (Hls.isSupported()) {
          const hls = new Hls({
            manifestLoadingMaxRetry: 5,
            manifestLoadingRetryDelay: 2000,
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (autoplay) video.play().catch(console.error);
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              handleError();
            }
          });
          return () => {
            hls.destroy();
            if (retryTimeout) clearTimeout(retryTimeout);
            cleanup();
          };
        } else {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            if (autoplay) video.play().catch(console.error);
          });
          video.addEventListener('error', handleError);
          return () => {
            video.removeEventListener('error', handleError);
            if (retryTimeout) clearTimeout(retryTimeout);
            cleanup();
          };
        }

      default:
        video.src = streamUrl;
        const onLoaded = () => {
          setIsLoading(false);
          if (autoplay) video.play().catch(console.error);
        };

        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', handleError);

        return () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', handleError);
          if (retryTimeout) clearTimeout(retryTimeout);
          cleanup();
        };
    }
  }, [streamUrl, streamType, autoplay, retryCount]);

  // Update play state and time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    isPlaying ? video.pause() : video.play().catch(console.error);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      video.volume = 1;
      setVolume(1);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    video.muted = newVolume === 0;
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
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        if (props.onTakeSnapshot) props.onTakeSnapshot(blob);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot-${camera.name.replace(/\s+/g, '_')}-${new Date().toISOString()}.jpg`;
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
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setPosition({ x: newX, y: newY });
  }, [isDragging, zoom]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black group overflow-hidden rounded-lg shadow-lg border border-white/5 ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      style={{ touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Video Content */}
      <video
        ref={videoRef}
        className="w-full h-full object-fill transition-transform duration-75"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        playsInline
        muted={isMuted}
      />

      {/* AI Metadata Overlay (Bounding Boxes) */}
      {props.detections && props.detections.length > 0 && (
        <MetadataOverlay
          detections={props.detections}
          width={videoRef.current?.videoWidth || 1280}
          height={videoRef.current?.videoHeight || 720}
        />
      )}

      {/* Snapshot Flash */}
      {showFlash && (
        <div className="absolute inset-0 bg-white animate-out fade-out duration-200 z-50 pointer-events-none" />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-2" />
          <span className="text-[10px] text-white/50 uppercase tracking-[0.2em]">Connecting Stream</span>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
          <h3 className="text-white font-bold">Stream Unavailable</h3>
          <p className="text-dark-400 text-xs mt-1">Check network connection or camera status</p>
        </div>
      )}

      {/* UI Elements */}
      <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-white pr-2 border-r border-white/20">{camera.name}</span>
              <span className="text-[10px] text-white/60 font-mono">{streamType.toUpperCase()}</span>
            </div>
            {camera.status === 'recording' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/40 self-start">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-red-400 font-black tracking-widest">RECORDING</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 items-end">
            {props.showPTZ && (
              <>
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
                    onPtzControl={props.onPtzControl}
                    presets={presets}
                    onPresetSelect={async (preset) => {
                      await props.onPtzControl?.('preset', { presetId: preset });
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar: Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-primary-400 transition-all active:scale-90"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="w-px h-4 bg-white/10 mx-1" />

              <div className="flex items-center gap-2 group/volume px-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0" max="1" step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 h-1 accent-primary-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                onClick={handleSnapshot}
                className="p-2 text-white/70 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-all active:scale-90"
                title="Take Snapshot"
              >
                <CameraIcon className="w-5 h-5" />
              </button>

              <button
                onClick={onFullscreen || handleFullscreen}
                className="p-2 text-white/70 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-all active:scale-90"
                title="Fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </button>

              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 text-white/70 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-all active:scale-90"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

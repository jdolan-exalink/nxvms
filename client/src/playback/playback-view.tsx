// ============================================================================
// PLAYBACK VIEW
// Main component for recorded video playback with premium interaction
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useResourcesStore } from '../core/store';
import { VideoPlayer } from '../live-view/video-player';
import { Timeline } from './timeline';
import { PlaybackControls } from './playback-controls';
import { Camera, StreamType } from '../shared/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { getApiClient } from '../shared/api-client';
import { addSeconds, subHours, startOfMinute } from 'date-fns';

export const PlaybackView: React.FC = () => {
  const { cameras, selectedCameraId } = useResourcesStore();
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time window: last 12 hours by default
  const [timeWindow, setTimeWindow] = useState({
    start: subHours(new Date(), 12),
    end: new Date(),
  });

  // Segments
  const [segments, setSegments] = useState<any[]>([]);

  // Volume state
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const playbackTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-select camera if none selected
  useEffect(() => {
    if (selectedCameraId) {
      const cam = cameras.find(c => c.id === selectedCameraId);
      if (cam) setSelectedCamera(cam);
    } else if (cameras.length > 0 && !selectedCamera) {
      setSelectedCamera(cameras[0]);
    }
  }, [selectedCameraId, cameras, selectedCamera]);

  // Load playback data when camera or window changes
  useEffect(() => {
    if (!selectedCamera) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      const apiClient = getApiClient();
      try {
        const [stream, timeline] = await Promise.all([
          apiClient.getPlaybackStream(selectedCamera.id),
          apiClient.getTimeline(
            selectedCamera.id,
            timeWindow.start.toISOString(),
            timeWindow.end.toISOString()
          )
        ]);

        let url = stream.playlistUrl;
        if (url && !url.startsWith('http')) {
          url = `${apiClient.getBaseURL()}${url}`;
        }
        setStreamUrl(url);
        setSegments(timeline.segments || []);
      } catch (err) {
        console.error('Failed to load playback data:', err);
        setError('Failed to load playback stream. The camera might not have recordings for this period.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCamera, timeWindow.start, timeWindow.end]);

  // Playback timer ticker
  useEffect(() => {
    if (playbackTimer.current) clearInterval(playbackTimer.current);

    if (isPlaying) {
      playbackTimer.current = setInterval(() => {
        setCurrentTime(prev => addSeconds(prev, 1 * playbackSpeed));
      }, 1000);
    }

    return () => {
      if (playbackTimer.current) clearInterval(playbackTimer.current);
    };
  }, [isPlaying, playbackSpeed]);

  const handleSeek = useCallback((time: Date) => {
    setCurrentTime(time);
    // In a real VMS, we would also update the HLS player's currentTime here
    // but since we are using a simplified model, we just update the local state.
  }, []);

  const handleRelativeSeek = useCallback((seconds: number) => {
    setCurrentTime(prev => addSeconds(prev, seconds));
  }, []);

  const handleSyncToLive = useCallback(() => {
    const now = new Date();
    setCurrentTime(now);
    setTimeWindow({
      start: subHours(now, 12),
      end: now
    });
  }, []);

  if (!selectedCamera) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-dark-950 text-dark-400 gap-4">
        <div className="p-8 rounded-full bg-dark-900 border border-white/5 shadow-2xl animate-pulse">
          <AlertCircle size={48} className="opacity-20" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white/50 mb-1">No Camera Selected</h2>
          <p className="text-sm">Select a camera from the sidebar to view recordings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden">
      {/* Header Info */}
      <div className="px-6 py-3 bg-dark-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-dark-600'}`} />
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{selectedCamera.name} <span className="text-primary-500 ml-2">Archive</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-dark-400 bg-black/40 px-2 py-1 rounded border border-white/5">
            Resolution: {selectedCamera.manufacturer} Standard
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="text-[10px] font-mono text-white/60">
            {currentTime.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="flex-1 min-h-0 relative group">
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 z-20">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
              <span className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">Decrypting Archive</span>
            </div>
          ) : streamUrl ? (
            <div className="w-full h-full p-6">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 bg-black relative">
                <VideoPlayer
                  camera={selectedCamera}
                  streamUrl={streamUrl}
                  streamType={StreamType.HLS}
                  autoplay={false}
                  muted={isMuted}
                />
                {error && (
                  <div className="absolute inset-0 bg-red-950/20 backdrop-blur-sm flex items-center justify-center p-8 z-30">
                    <div className="max-w-md bg-dark-900 p-6 rounded-2xl border border-red-500/30 shadow-2xl text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-white font-bold mb-2">Playback Error</h3>
                      <p className="text-dark-400 text-xs mb-4">{error}</p>
                      <button
                        onClick={() => setTimeWindow(prev => ({ ...prev }))}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-dark-500">
              <AlertCircle size={40} className="opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No archive footage found</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Controls Section */}
      <div className="flex flex-col">
        <Timeline
          startTime={timeWindow.start}
          endTime={timeWindow.end}
          currentTime={currentTime}
          onSeek={handleSeek}
          segments={segments}
          isLoading={loading}
        />

        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          playbackSpeed={playbackSpeed}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onSeek={handleRelativeSeek}
          onSpeedChange={setPlaybackSpeed}
          onVolumeChange={setVolume}
          onToggleMute={() => setIsMuted(!isMuted)}
          onSyncToLive={handleSyncToLive}
        />
      </div>
    </div>
  );
};

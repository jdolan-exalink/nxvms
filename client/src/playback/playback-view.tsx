// ============================================================================
// PLAYBACK VIEW
// Main component for recorded video playback
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useResourcesStore } from '../core/store';
import { VideoPlayer } from '../live-view/video-player';
import { Timeline } from './timeline';
import { Camera, StreamType } from '../shared/types';
import { Play, Pause, ChevronLeft, ChevronRight, FastForward, Rewind, Loader2 } from 'lucide-react';
import { getApiClient } from '../shared/api-client';

export const PlaybackView: React.FC = () => {
  const { cameras, selectedCameraId } = useResourcesStore();
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Time window: last 24 hours
  const [timeWindow] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  // Segments
  const [segments, setSegments] = useState<any[]>([]);

  useEffect(() => {
    if (selectedCameraId) {
      const cam = cameras.find(c => c.id === selectedCameraId);
      if (cam) {
        setSelectedCamera(cam);
        loadPlaybackData(cam.id);
      }
    } else if (cameras.length > 0 && !selectedCamera) {
      setSelectedCamera(cameras[0]);
      loadPlaybackData(cameras[0].id);
    }
  }, [selectedCameraId, cameras]);

  const loadPlaybackData = async (cameraId: string) => {
    setLoading(true);
    const apiClient = getApiClient();
    try {
      const [stream, timeline] = await Promise.all([
        apiClient.getPlaybackStream(cameraId),
        apiClient.getTimeline(cameraId, timeWindow.start.toISOString(), timeWindow.end.toISOString())
      ]);
      
      let url = stream.playlistUrl;
      if (url && !url.startsWith('http')) {
        url = `${apiClient.getBaseURL()}${url}`;
      }
      setStreamUrl(url);
      setSegments(timeline.segments || []);
    } catch (err) {
      console.error('Failed to load playback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => new Date(prev.getTime() + (1000 * playbackSpeed)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleSeek = (time: Date) => {
    setCurrentTime(time);
  };

  if (!selectedCamera) {
    return (
      <div className="h-full flex items-center justify-center text-dark-400">
        Select a camera from the tree to start playback
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Video Area */}
      <div className="flex-1 min-h-0 p-4">
        <div className="h-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-dark-700 bg-black relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
          ) : streamUrl ? (
            <VideoPlayer
              camera={selectedCamera}
              streamUrl={streamUrl}
              streamType={StreamType.HLS}
              autoplay={false}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-dark-500">
              No playback stream available for this camera
            </div>
          )}
        </div>
      </div>

      {/* Controls & Timeline */}
      <div className="bg-dark-800 border-t border-dark-700">
        <div className="flex items-center justify-center gap-4 py-2 border-b border-dark-700/50">
          <button className="p-2 text-dark-300 hover:text-white"><Rewind size={20} /></button>
          <button className="p-2 text-dark-300 hover:text-white" onClick={() => setCurrentTime(new Date(currentTime.getTime() - 1000))}><ChevronLeft size={20} /></button>
          <button 
            className="w-10 h-10 flex items-center justify-center bg-primary-600 rounded-full text-white hover:bg-primary-500 transition-colors"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button className="p-2 text-dark-300 hover:text-white" onClick={() => setCurrentTime(new Date(currentTime.getTime() + 1000))}><ChevronRight size={20} /></button>
          <button className="p-2 text-dark-300 hover:text-white"><FastForward size={20} /></button>
          
          <div className="h-4 w-[1px] bg-dark-600 mx-2" />
          
          <select 
            className="bg-dark-700 text-xs text-white border-none rounded px-2 py-1 outline-none"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={2}>2.0x</option>
            <option value={4}>4.0x</option>
            <option value={8}>8.0x</option>
            <option value={16}>16.0x</option>
          </select>
        </div>

        <Timeline
          startTime={timeWindow.start}
          endTime={timeWindow.end}
          currentTime={currentTime}
          onSeek={handleSeek}
          segments={segments}
        />
      </div>
    </div>
  );
};

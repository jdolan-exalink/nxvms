// ============================================================================
// PREMIUM VMS TIMELINE
// Professional timeline with segments, zoom levels, and smooth scrubbing
// ============================================================================

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { format, addSeconds, differenceInSeconds, startOfDay, endOfDay } from 'date-fns';
import { ZoomIn, ZoomOut, Maximize2, MousePointer2 } from 'lucide-react';

interface TimelineProps {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  onSeek: (time: Date) => void;
  segments?: { start: string; end: string; type: 'motion' | 'continuous' | 'secondary' }[];
  isLoading?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  startTime,
  endTime,
  currentTime,
  onSeek,
  segments = [],
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = full view, higher = zoomed in
  const [scrollOffset, setScrollOffset] = useState(0); // Offset in pixels

  // Time window calculations
  const totalSeconds = differenceInSeconds(endTime, startTime);

  // Calculate position for a given date
  const getPosition = useCallback((date: Date) => {
    const elapsed = differenceInSeconds(date, startTime);
    return (elapsed / totalSeconds) * 100;
  }, [startTime, totalSeconds]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientX);
  };

  const handleInteraction = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, x / rect.width));
    const seekTime = addSeconds(startTime, Math.floor(totalSeconds * (percentage / 100)));
    onSeek(seekTime);
  }, [startTime, totalSeconds, onSeek]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleInteraction(e.clientX);
    }
  }, [isDragging, handleInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate markers (every hour/minute depending on zoom)
  const markers = useMemo(() => {
    const items = [];
    const interval = totalSeconds > 3600 ? 3600 : 600; // Hour or 10 min
    const count = Math.floor(totalSeconds / interval);

    for (let i = 0; i <= count; i++) {
      const time = addSeconds(startTime, i * interval);
      items.push({
        pos: (i * interval / totalSeconds) * 100,
        label: format(time, 'HH:mm'),
        isMajor: i % (totalSeconds > 12 * 3600 ? 6 : 1) === 0
      });
    }
    return items;
  }, [startTime, totalSeconds]);

  return (
    <div className="flex flex-col select-none bg-dark-950/50 backdrop-blur-md border-t border-white/5 shadow-2xl overflow-hidden">
      {/* Timeline Header - Zoom & Info */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Playback Range:</span>
            <span className="text-[10px] font-mono text-white/80">{format(startTime, 'MMM dd, HH:mm')} - {format(endTime, 'HH:mm')}</span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-[10px] text-primary-400 font-bold uppercase">Updating Range...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
          <button className="p-1 hover:bg-white/10 rounded transition-colors text-dark-400 hover:text-white"><ZoomOut size={14} /></button>
          <div className="w-10 text-center text-[10px] font-bold text-white/60">100%</div>
          <button className="p-1 hover:bg-white/10 rounded transition-colors text-dark-400 hover:text-white"><ZoomIn size={14} /></button>
          <div className="w-px h-3 bg-white/10 mx-1" />
          <button className="p-1 hover:bg-white/10 rounded transition-colors text-dark-400 hover:text-white"><Maximize2 size={14} /></button>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="relative h-20 group">
        {/* Time Scale */}
        <div className="absolute inset-0 flex items-end pb-1 pointer-events-none opacity-30">
          {markers.map((m, i) => (
            <div
              key={i}
              className="absolute border-l border-white/40"
              style={{ left: `${m.pos}%`, height: m.isMajor ? '20%' : '10%' }}
            >
              {m.isMajor && (
                <span className="absolute -top-4 -left-3 text-[8px] font-mono text-white/50">{m.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Interaction Track */}
        <div
          ref={containerRef}
          className="absolute inset-0 cursor-crosshair z-20"
          onMouseDown={handleMouseDown}
        />

        {/* Recording Segments */}
        <div className="absolute inset-0 overflow-hidden py-4 flex items-center">
          <div className="w-full h-8 bg-black/40 rounded border border-white/5 inset-shadow-sm overflow-hidden relative">
            {segments.map((segment, i) => {
              const s = new Date(segment.start);
              const e = new Date(segment.end);
              const startPos = getPosition(s);
              const endPos = getPosition(e);
              const width = endPos - startPos;

              if (width <= 0) return null;

              return (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 transition-opacity duration-300 ${segment.type === 'motion'
                      ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                      : segment.type === 'secondary'
                        ? 'bg-blue-400/50'
                        : 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                    }`}
                  style={{ left: `${startPos}%`, width: `${width}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none transition-all duration-75 ease-linear"
          style={{ left: `${getPosition(currentTime)}%` }}
        >
          <div className="absolute -top-1 -left-[5px] w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <div className="absolute top-0 bottom-0 -left-[14px] w-[28px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

          {/* Floating Timebubble on current time */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-600 rounded text-[10px] font-black text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {format(currentTime, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Date & Detailed Info Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-black/60 shadow-inner">
        <div className="flex items-center gap-1.5">
          <MousePointer2 size={12} className="text-primary-400" />
          <span className="text-[11px] font-black text-white/90 drop-shadow-sm uppercase">Live Tracking</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
            <span className="text-[10px] font-bold text-dark-400 uppercase">Selected Time:</span>
            <span className="text-[12px] font-mono font-bold text-primary-400">{format(currentTime, 'yyyy-MM-dd HH:mm:ss')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

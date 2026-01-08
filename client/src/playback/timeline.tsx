// ============================================================================
// TIMELINE
// Video playback timeline for scrubbing and seeking
// ============================================================================

import React, { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';

interface TimelineProps {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  onSeek: (time: Date) => void;
  segments?: { start: Date; end: Date; type: 'motion' | 'continuous' }[];
}

export const Timeline: React.FC<TimelineProps> = ({
  startTime,
  endTime,
  currentTime,
  onSeek,
  segments = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate percentage for a given date
  const getPercentage = (date: Date) => {
    const total = endTime.getTime() - startTime.getTime();
    const current = date.getTime() - startTime.getTime();
    return Math.max(0, Math.min(100, (current / total) * 100));
  };

  const currentPos = getPercentage(currentTime);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if ((isDragging || e.type === 'mousedown') && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e as MouseEvent).clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, x / rect.width));
      
      const totalTime = endTime.getTime() - startTime.getTime();
      const seekTime = new Date(startTime.getTime() + (totalTime * percentage) / 100);
      onSeek(seekTime);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-2 p-4 bg-dark-800 border-t border-dark-700 select-none">
      {/* Time Display */}
      <div className="flex justify-between text-xs text-dark-400">
        <span>{format(startTime, 'HH:mm:ss')}</span>
        <span className="text-primary-400 font-bold">{format(currentTime, 'yyyy-MM-dd HH:mm:ss')}</span>
        <span>{format(endTime, 'HH:mm:ss')}</span>
      </div>

      {/* Timeline Track */}
      <div
        ref={containerRef}
        className="relative h-12 bg-dark-900 rounded cursor-pointer overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        {/* Recording Segments */}
        {segments.map((segment, i) => {
          const start = getPercentage(segment.start);
          const end = getPercentage(segment.end);
          return (
            <div
              key={i}
              className={`absolute top-0 bottom-0 ${
                segment.type === 'motion' ? 'bg-yellow-500/40' : 'bg-primary-500/20'
              }`}
              style={{ left: `${start}%`, width: `${end - start}%` }}
            />
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary-500 z-10 shadow-[0_0_8px_rgba(37,99,235,0.8)]"
          style={{ left: `${currentPos}%` }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
        </div>
      </div>
    </div>
  );
};

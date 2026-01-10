// ============================================================================
// DIGITAL ZOOM CONTROL
// Software zoom for video player with premium aesthetics
// ============================================================================

import React, { useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface DigitalZoomProps {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  onZoomChange: (zoom: number) => void;
}

export const DigitalZoom: React.FC<DigitalZoomProps> = ({
  minZoom = 1,
  maxZoom = 4,
  initialZoom = 1,
  onZoomChange,
}) => {
  const [zoom, setZoom] = useState(initialZoom);

  // Sync internal state with prop if it changes from outside (e.g. mouse wheel)
  React.useEffect(() => {
    setZoom(initialZoom);
  }, [initialZoom]);

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
      setZoom(clampedZoom);
      onZoomChange(clampedZoom);
    },
    [minZoom, maxZoom, onZoomChange]
  );

  const handleZoomIn = () => handleZoomChange(zoom + 0.2);
  const handleZoomOut = () => handleZoomChange(zoom - 0.2);
  const handleReset = () => handleZoomChange(1);

  return (
    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-2xl p-2.5 border border-white/10 shadow-2xl group/zoom animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-1.5 px-2 border-r border-white/10 mr-1">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-70">Zoom</span>
      </div>

      <button
        onClick={handleZoomOut}
        disabled={zoom <= minZoom}
        className="p-1.5 text-dark-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all rounded-lg active:scale-90"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="relative group/input">
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.1}
            value={zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-dark-900 rounded-full appearance-none cursor-pointer overflow-hidden border border-white/5"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - minZoom) / (maxZoom - minZoom)) * 100
                }%, #1f2937 ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, #1f2937 100%)`,
            }}
          />
          {/* Tooltip on hover */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary-600 text-white text-[10px] font-bold rounded opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none shadow-lg">
            {(zoom).toFixed(1)}x
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-primary-400 w-8 text-center bg-primary-500/10 py-0.5 rounded border border-primary-500/20">
          {(zoom).toFixed(1)}x
        </span>
      </div>

      <button
        onClick={handleZoomIn}
        disabled={zoom >= maxZoom}
        className="p-1.5 text-dark-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all rounded-lg active:scale-90"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {zoom !== 1 && (
        <button
          onClick={handleReset}
          className="ml-1 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-lg active:scale-90 border border-red-500/20"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

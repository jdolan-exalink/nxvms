// ============================================================================
// DIGITAL ZOOM CONTROL
// Software zoom for video player
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
    <div className="flex items-center gap-2 bg-dark-800 rounded px-3 py-2">
      <button
        onClick={handleZoomOut}
        disabled={zoom <= minZoom}
        className="p-1 text-dark-400 hover:text-white disabled:text-dark-500 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 flex-1">
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={0.1}
          value={zoom}
          onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          className="w-24 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((zoom - minZoom) / (maxZoom - minZoom)) * 100
            }%, #374151 ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, #374151 100%)`,
          }}
        />
        <span className="text-xs font-semibold text-dark-300 w-8">
          {(zoom * 10).toFixed(0)}%
        </span>
      </div>

      <button
        onClick={handleZoomIn}
        disabled={zoom >= maxZoom}
        className="p-1 text-dark-400 hover:text-white disabled:text-dark-500 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {zoom !== 1 && (
        <button
          onClick={handleReset}
          className="p-1 text-dark-400 hover:text-white transition-colors ml-1"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

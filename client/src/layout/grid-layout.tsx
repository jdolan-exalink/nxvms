// ============================================================================
// GRID LAYOUT
// 1x1, 2x2, 3x3, 4x4 grid layouts for camera views
// ============================================================================

import React, { useMemo } from 'react';
import { useLayoutStore } from '../core/store';
import { LayoutSize, Camera, StreamType } from '../shared/types';
import { LAYOUT_GRID } from '../shared/constants';
import { VideoPlayer } from '../live-view/video-player';

interface GridLayoutProps {
  cameras: (Camera | null)[];
  onCameraClick?: (index: number) => void;
  onCameraDrop?: (index: number, cameraId: string) => void;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  cameras,
  onCameraClick,
  onCameraDrop,
}) => {
  const selectedLayoutSize = useLayoutStore((state) => state.selectedLayoutSize);
  const setLayoutSize = useLayoutStore((state) => state.setLayoutSize);

  const gridConfig = LAYOUT_GRID[selectedLayoutSize as keyof typeof LAYOUT_GRID];

  // Calculate grid cell dimensions
  const cellStyle = useMemo(() => {
    const cols = gridConfig.cols;
    const rows = gridConfig.rows;
    return {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    };
  }, [gridConfig]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const cameraId = e.dataTransfer.getData('text/plain');
    if (onCameraDrop && cameraId) {
      onCameraDrop(index, cameraId);
    }
  };

  const handleDragStart = (e: React.DragEvent, camera: Camera) => {
    e.dataTransfer.setData('text/plain', camera.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Layout Selector */}
      <div className="flex items-center gap-2 p-4 bg-dark-800 border-b border-dark-700">
        <span className="text-sm text-dark-400">Layout:</span>
        {[1, 4, 9, 16].map((size) => (
          <button
            key={size}
            onClick={() => setLayoutSize(size)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedLayoutSize === size
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {size === 1 ? '1x1' : size === 4 ? '2x2' : size === 9 ? '3x3' : '4x4'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 p-4 bg-dark-900">
        <div
          className="grid gap-2 h-full"
          style={cellStyle}
        >
          {Array.from({ length: selectedLayoutSize }).map((_, index) => {
            const camera = cameras[index];
            return (
              <div
                key={index}
                className="relative bg-dark-800 rounded-lg overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-colors group"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {camera ? (
                  <div className="h-full w-full">
                    <VideoPlayer
                      camera={camera}
                      streamUrl={camera.streams[0]?.url || ''}
                      streamType={camera.streams[0]?.type || StreamType.HLS}
                      autoplay={true}
                      muted={true}
                    />
                    
                    {/* Drag handle overlay (hidden but present for D&D) */}
                    <div
                      className="absolute inset-x-0 top-0 h-10 cursor-move z-10"
                      draggable
                      onDragStart={(e) => handleDragStart(e, camera)}
                      onClick={() => onCameraClick?.(index)}
                    />
                  </div>
                ) : (
                  /* Empty Cell */
                  <div className="absolute inset-0 flex items-center justify-center text-dark-600 group-hover:text-dark-500 transition-colors">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

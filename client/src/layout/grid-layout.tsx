// ============================================================================
// GRID LAYOUT
// 1x1, 2x2, 3x3, 4x4 grid layouts for camera views
// ============================================================================

import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { useLayoutStore } from '../core/store';
import { LayoutSize, Camera, StreamType } from '../shared/types';
import { LAYOUT_GRID } from '../shared/constants';
import { VideoPlayer } from '../live-view/video-player';

interface GridLayoutProps {
  cameras: (Camera | null)[];
  selectedCameraId?: string | null;
  maximizedIndex?: number | null;
  onCameraClick?: (index: number) => void;
  onCameraDoubleClick?: (index: number) => void;
  onCameraDrop?: (index: number, cameraId: string) => void;
  onCameraRemove?: (index: number) => void;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  cameras,
  selectedCameraId,
  maximizedIndex,
  onCameraClick,
  onCameraDoubleClick,
  onCameraDrop,
  onCameraRemove,
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
      <div className={`flex items-center gap-2 p-4 bg-dark-800 border-b border-dark-700 transition-all duration-300 ${
        maximizedIndex !== null ? 'h-0 p-0 border-0 overflow-hidden' : ''
      }`}>
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
      <div className="flex-1 p-4 bg-dark-900 relative">
        <div
          className={`grid gap-2 h-full transition-all duration-300 ${
            maximizedIndex !== null ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
          }`}
          style={cellStyle}
        >
          {Array.from({ length: selectedLayoutSize }).map((_, index) => {
            const camera = cameras[index];
            
            // Find best stream for live view (not recordings)
            const liveStream = camera?.streams?.find(s => 
              s.type === StreamType.FRIGATE_MSE || 
              s.profileName?.toLowerCase().includes('live')
            ) || camera?.streams?.[0];

            return (
              <div
                key={index}
                className={`relative bg-dark-800 rounded-lg overflow-hidden border-2 transition-all group ${
                  camera && selectedCameraId === camera.id
                    ? 'border-primary-500 shadow-lg shadow-primary-500/20 z-10'
                    : 'border-dark-700 hover:border-dark-500'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDoubleClick={() => onCameraDoubleClick?.(index)}
              >
                {camera ? (
                  <div className="h-full w-full" onClick={() => onCameraClick?.(index)}>
                    <VideoPlayer
                      camera={camera}
                      streamUrl={liveStream?.url || ''}
                      streamType={liveStream?.type || StreamType.HLS}
                      autoplay={true}
                      muted={selectedCameraId !== camera.id}
                    />

                    {/* Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCameraRemove?.(index);
                      }}
                      className="absolute top-2 right-2 z-30 p-1 bg-black/40 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Close stream"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Drag handle overlay */}
                    <div
                      className="absolute inset-x-0 top-0 h-10 cursor-move z-10"
                      draggable
                      onDragStart={(e) => handleDragStart(e, camera)}
                      onWheel={(e) => {
                         // Propagate wheel events to VideoPlayer container
                         // We don't stop propagation, so it should reach parent
                      }}
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

        {/* Maximized View Overlay */}
        {maximizedIndex !== null && cameras[maximizedIndex] && (
          <div 
            className="absolute inset-4 z-50 bg-dark-900 rounded-lg overflow-hidden border-2 border-primary-500 shadow-2xl animate-in zoom-in-95 duration-200"
            onDoubleClick={() => onCameraDoubleClick?.(maximizedIndex)}
          >
            {(() => {
               const camera = cameras[maximizedIndex]!;
               const liveStream = camera.streams?.find(s => 
                 s.type === StreamType.FRIGATE_MSE || 
                 s.profileName?.toLowerCase().includes('live')
               ) || camera.streams?.[0];

               return (
                 <div className="h-full w-full relative">
                   <VideoPlayer
                     camera={camera}
                     streamUrl={liveStream?.url || ''}
                     streamType={liveStream?.type || StreamType.HLS}
                     autoplay={true}
                     muted={selectedCameraId !== camera.id}
                     showPTZ={true}
                   />
                   
                   {/* Close Button For Maximized View */}
                   <button
                     onClick={() => onCameraDoubleClick?.(maximizedIndex)}
                     className="absolute top-4 right-4 z-[60] p-2 bg-black/60 hover:bg-red-500 text-white rounded-full transition-all"
                     title="Restore to grid"
                   >
                     <X className="w-6 h-6" />
                   </button>

                   {/* Info Overlay */}
                   <div className="absolute top-4 left-4 z-[60] px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-sm text-white font-medium flex items-center gap-2 border border-white/10">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     {camera.name} - Modo Maximizado
                   </div>
                 </div>
               );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// LIVE VIEW
// Main component for real-time video monitoring
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useResourcesStore, useLayoutStore } from '../core/store';
import { GridLayout } from '../layout/grid-layout';
import { Camera } from '../shared/types';

export const LiveView: React.FC = () => {
  const { cameras, getCameraById } = useResourcesStore();
  const { selectedLayoutSize } = useLayoutStore();
  
  // State for cameras in the grid
  const [gridCameras, setGridCameras] = useState<(Camera | null)[]>(
    Array(16).fill(null)
  );

  // Initialize with some cameras if available and grid is empty
  useEffect(() => {
    if (cameras.length > 0 && gridCameras.every(c => c === null)) {
      const initialGrid = [...gridCameras];
      cameras.slice(0, selectedLayoutSize).forEach((cam, i) => {
        initialGrid[i] = cam;
      });
      setGridCameras(initialGrid);
    }
  }, [cameras, selectedLayoutSize]);

  const handleCameraDrop = (index: number, cameraId: string) => {
    const camera = getCameraById(cameraId);
    if (camera) {
      setGridCameras(prev => {
        const next = [...prev];
        next[index] = camera;
        return next;
      });
    }
  };

  const handleCameraClick = (index: number) => {
    // Optionally handle camera click (e.g. expand to 1x1)
    console.log(`Camera clicked at grid index ${index}`);
  };

  return (
    <div className="h-full w-full bg-dark-900 overflow-hidden">
      <GridLayout
        cameras={gridCameras}
        onCameraClick={handleCameraClick}
        onCameraDrop={handleCameraDrop}
      />
    </div>
  );
};

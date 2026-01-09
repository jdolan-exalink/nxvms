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

  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [maximizedIndex, setMaximizedIndex] = useState<number | null>(null);

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
    const camera = gridCameras[index];
    if (camera) {
      setSelectedCameraId(camera.id);
      console.log(`Camera selected: ${camera.name} at grid index ${index}`);
    } else {
      setSelectedCameraId(null);
    }
  };

  const handleCameraDoubleClick = (index: number) => {
    setMaximizedIndex(prev => (prev === index ? null : index));
  };

  const handleCameraRemove = (index: number) => {
    setGridCameras(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    // If we removed the selected camera, deselect it
    const removedCamera = gridCameras[index];
    if (removedCamera && removedCamera.id === selectedCameraId) {
      setSelectedCameraId(null);
    }
  };

  return (
    <div className="h-full w-full bg-dark-900 overflow-hidden relative">
      <GridLayout
        cameras={gridCameras}
        selectedCameraId={selectedCameraId}
        maximizedIndex={maximizedIndex}
        onCameraClick={handleCameraClick}
        onCameraDoubleClick={handleCameraDoubleClick}
        onCameraDrop={handleCameraDrop}
        onCameraRemove={handleCameraRemove}
      />
    </div>
  );
};

// ============================================================================
// LIVE VIEW
// Main component for real-time video monitoring
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useResourcesStore, useLayoutStore } from '../core/store';
import { GridLayout } from '../layout/grid-layout';
import { Camera } from '../shared/types';

export const LiveView: React.FC = () => {
  const { cameras, getCameraById } = useResourcesStore();
  const { selectedLayoutSize, gridCameras, setGridCamera, removeGridCamera } = useLayoutStore();

  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [maximizedIndex, setMaximizedIndex] = useState<number | null>(null);

  // Map persisted camera IDs to real objects
  const gridCamerasData = useMemo(() => {
    return gridCameras.map(id => id ? getCameraById(id) || null : null);
  }, [gridCameras, cameras]);

  const handleCameraDrop = (index: number, cameraId: string) => {
    setGridCamera(index, cameraId);
  };

  const handleCameraClick = (index: number) => {
    const camera = gridCamerasData[index];
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
    removeGridCamera(index);
    // If we removed the selected camera, deselect it
    const removedCameraId = gridCameras[index];
    if (removedCameraId && removedCameraId === selectedCameraId) {
      setSelectedCameraId(null);
    }
  };

  // Add listener for sidebar double-click to fill gaps
  useEffect(() => {
    const handleSidebarDoubleClick = (e: any) => {
      if (e.detail && e.detail.cameraId) {
        const cameraId = e.detail.cameraId;

        // Find if already in grid
        if (gridCameras.includes(cameraId)) {
          // Maybe just select it?
          setSelectedCameraId(cameraId);
          return;
        }

        // Find first empty slot within current layout size
        const emptyIndex = gridCameras.findIndex((camId, idx) => idx < selectedLayoutSize && camId === null);

        if (emptyIndex !== -1) {
          setGridCamera(emptyIndex, cameraId);
          setSelectedCameraId(cameraId);
        }
      }
    };

    window.addEventListener('nx-camera-double-click', handleSidebarDoubleClick);
    return () => window.removeEventListener('nx-camera-double-click', handleSidebarDoubleClick);
  }, [gridCameras, selectedLayoutSize, setGridCamera]);

  return (
    <div className="h-full w-full bg-dark-900 overflow-hidden relative">
      <GridLayout
        cameras={gridCamerasData}
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

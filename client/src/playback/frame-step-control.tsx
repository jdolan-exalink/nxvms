import React from 'react';
import { StepBack, StepForward } from 'lucide-react';

export interface FrameStepControlProps {
  currentFrame: number;
  totalFrames: number;
  fps: number;
  onFrameStep: (direction: 'forward' | 'backward', frames?: number) => void;
}

export const FrameStepControl: React.FC<FrameStepControlProps> = ({
  currentFrame,
  totalFrames,
  fps,
  onFrameStep,
}) => {
  const handleStepForward = (frames: number = 1) => {
    onFrameStep('forward', frames);
  };

  const handleStepBackward = (frames: number = 1) => {
    onFrameStep('backward', frames);
  };

  const formatFrameTime = (frame: number): string => {
    const seconds = frame / fps;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-dark-800 rounded-lg p-3">
      {/* Step backward button */}
      <button
        onClick={() => handleStepBackward(1)}
        className="p-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400"
        title="Previous frame"
      >
        <StepBack className="w-5 h-5" />
      </button>

      {/* Multi-frame backward button */}
      <button
        onClick={() => handleStepBackward(5)}
        className="px-3 py-2 text-sm hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400 font-medium"
        title="Back 5 frames"
      >
        -5f
      </button>

      {/* Frame display */}
      <div className="flex flex-col items-center gap-1 px-3 py-2 bg-dark-900 rounded">
        <span className="text-xs text-dark-400">Frame</span>
        <span className="text-sm font-mono font-bold text-white">
          {currentFrame.toString().padStart(6, '0')} / {totalFrames.toString().padStart(6, '0')}
        </span>
        <span className="text-xs text-dark-400">{formatFrameTime(currentFrame)}</span>
        <span className="text-xs text-dark-500">{fps.toFixed(1)} fps</span>
      </div>

      {/* Multi-frame forward button */}
      <button
        onClick={() => handleStepForward(5)}
        className="px-3 py-2 text-sm hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400 font-medium"
        title="Forward 5 frames"
      >
        +5f
      </button>

      {/* Step forward button */}
      <button
        onClick={() => handleStepForward(1)}
        className="p-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400"
        title="Next frame"
      >
        <StepForward className="w-5 h-5" />
      </button>

      {/* Progress bar for frame display */}
      <div className="flex-1 h-1 bg-dark-700 rounded-full">
        <div
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
        />
      </div>
    </div>
  );
};

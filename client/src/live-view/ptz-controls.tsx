// ============================================================================
// PTZ CONTROLS
// Pan-Tilt-Zoom controls for ONVIF cameras
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Home,
  Eye,
} from 'lucide-react';

interface PTZControlsProps {
  cameraId: string;
  isEnabled: boolean;
  onPtzControl?: (action: string, params?: any) => Promise<void>;
  presets?: Array<{ id: string; name: string }>;
  onPresetSelect?: (presetId: string) => Promise<void>;
}

export const PTZControls: React.FC<PTZControlsProps> = ({
  cameraId,
  isEnabled,
  onPtzControl,
  presets = [],
  onPresetSelect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePtzAction = useCallback(
    async (action: string, params?: any) => {
      if (!isEnabled || !onPtzControl) return;

      setIsLoading(true);
      try {
        await onPtzControl(action, params);
      } catch (error) {
        console.error(`PTZ action ${action} failed:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [isEnabled, onPtzControl]
  );

  const handlePreset = useCallback(
    async (presetId: string) => {
      setActivePreset(presetId);
      try {
        if (onPresetSelect) {
          await onPresetSelect(presetId);
        } else {
          await handlePtzAction('preset', { presetId });
        }
      } finally {
        setActivePreset(null);
      }
    },
    [handlePtzAction, onPresetSelect]
  );

  if (!isEnabled) {
    return (
      <div className="p-3 bg-dark-800 rounded border border-dark-700 text-sm text-dark-400">
        PTZ controls not available for this camera
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-dark-800 rounded border border-dark-700">
      {/* Direction Controls */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-dark-300 uppercase">Pan / Tilt</p>
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button
            onClick={() => handlePtzAction('up')}
            disabled={isLoading || !isEnabled}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded transition-colors"
            title="Pan Up"
          >
            <ArrowUp className="w-4 h-4 mx-auto" />
          </button>
          <div />

          <button
            onClick={() => handlePtzAction('left')}
            disabled={isLoading || !isEnabled}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded transition-colors"
            title="Pan Left"
          >
            <ArrowLeft className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => handlePtzAction('home')}
            disabled={isLoading || !isEnabled}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded transition-colors"
            title="Home Position"
          >
            <Home className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => handlePtzAction('right')}
            disabled={isLoading || !isEnabled}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded transition-colors"
            title="Pan Right"
          >
            <ArrowRight className="w-4 h-4 mx-auto" />
          </button>

          <div />
          <button
            onClick={() => handlePtzAction('down')}
            disabled={isLoading || !isEnabled}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded transition-colors"
            title="Pan Down"
          >
            <ArrowDown className="w-4 h-4 mx-auto" />
          </button>
          <div />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-dark-300 uppercase">Zoom</p>
        <div className="flex gap-1">
          <button
            onClick={() => handlePtzAction('zoom', { direction: 'in' })}
            disabled={isLoading || !isEnabled}
            className="flex-1 p-2 bg-green-600 hover:bg-green-700 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded transition-colors flex items-center justify-center gap-2"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="text-xs">Zoom In</span>
          </button>
          <button
            onClick={() => handlePtzAction('zoom', { direction: 'out' })}
            disabled={isLoading || !isEnabled}
            className="flex-1 p-2 bg-green-600 hover:bg-green-700 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded transition-colors flex items-center justify-center gap-2"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
            <span className="text-xs">Zoom Out</span>
          </button>
        </div>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-dark-300 uppercase">Presets</p>
          <div className="grid grid-cols-2 gap-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset.id)}
                disabled={isLoading || !isEnabled}
                className={`p-2 rounded transition-colors text-xs font-medium truncate ${
                  activePreset === preset.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 disabled:text-dark-500 text-dark-200'
                }`}
                title={preset.name}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {isLoading && (
        <div className="text-xs text-blue-400 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Sending command...
        </div>
      )}
    </div>
  );
};

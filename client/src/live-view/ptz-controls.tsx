// ============================================================================
// PTZ CONTROLS
// Pan-Tilt-Zoom controls for ONVIF cameras with premium aesthetics
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Navigation,
  Settings,
} from 'lucide-react';

interface PTZControlsProps {
  cameraId: string;
  isEnabled: boolean;
  onPtzControl?: (action: string, params?: any) => Promise<void>;
  presets?: Array<{ id: string; name: string }>;
  onPresetSelect?: (presetId: string) => Promise<void>;
}

export const PTZControls: React.FC<PTZControlsProps> = ({
  isEnabled,
  onPtzControl,
  presets = [],
  onPresetSelect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

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
        setTimeout(() => setActivePreset(null), 1000);
      }
    },
    [handlePtzAction, onPresetSelect]
  );

  if (!isEnabled) {
    return (
      <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-xs text-dark-400 italic text-center">
        PTZ not supported
      </div>
    );
  }

  return (
    <div className="relative group/ptz">
      <div className="flex flex-col gap-3 p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-70">PTZ Control</span>
          </div>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`p-1.5 rounded-lg transition-all ${showPresets ? 'bg-primary-500 text-white' : 'text-dark-400 hover:bg-white/10 hover:text-white'}`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-6 items-center">
          {/* D-Pad */}
          <div className="relative w-24 h-24 bg-dark-900/50 rounded-full p-1 border border-white/5 shadow-inner">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5">
              <div />
              <button
                onMouseDown={() => handlePtzAction('up')}
                className="flex items-center justify-center text-dark-300 hover:text-white hover:bg-primary-500/20 active:scale-95 transition-all rounded-lg"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div />

              <button
                onMouseDown={() => handlePtzAction('left')}
                className="flex items-center justify-center text-dark-300 hover:text-white hover:bg-primary-500/20 active:scale-95 transition-all rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePtzAction('home')}
                className="flex items-center justify-center bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white active:scale-90 transition-all rounded-full m-1 shadow-lg"
              >
                <Navigation className="w-4 h-4" />
              </button>
              <button
                onMouseDown={() => handlePtzAction('right')}
                className="flex items-center justify-center text-dark-300 hover:text-white hover:bg-primary-500/20 active:scale-95 transition-all rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div />
              <button
                onMouseDown={() => handlePtzAction('down')}
                className="flex items-center justify-center text-dark-300 hover:text-white hover:bg-primary-500/20 active:scale-95 transition-all rounded-lg"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <div />
            </div>
          </div>

          {/* Zoom Slider replacement (Direct buttons for PTZ Zoom) */}
          <div className="flex flex-col gap-2">
            <button
              onMouseDown={() => handlePtzAction('zoom', { direction: 'in' })}
              className="p-3 bg-white/5 hover:bg-primary-500/20 text-dark-300 hover:text-white rounded-xl border border-white/5 transition-all active:scale-95"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="h-px bg-white/10 mx-2" />
            <button
              onMouseDown={() => handlePtzAction('zoom', { direction: 'out' })}
              className="p-3 bg-white/5 hover:bg-primary-500/20 text-dark-300 hover:text-white rounded-xl border border-white/5 transition-all active:scale-95"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Presets Grid (Collapsible) */}
        {showPresets && presets.length > 0 && (
          <div className="mt-2 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset.id)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-medium transition-all truncate border ${activePreset === preset.id
                  ? 'bg-primary-500 border-primary-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                  : 'bg-white/5 border-white/5 text-dark-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        {/* Status Line */}
        {isLoading && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary-500 rounded-full shadow-lg shadow-primary-500/40 animate-bounce">
            <span className="text-[8px] text-white font-bold uppercase tracking-tighter">Command Sent</span>
          </div>
        )}
      </div>
    </div>
  );
};

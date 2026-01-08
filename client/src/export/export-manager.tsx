// ============================================================================
// EXPORT DIALOG
// Configure and start video exports
// ============================================================================

import React from 'react';
import { Download, Clock, Settings, FileVideo } from 'lucide-react';

export const ExportManager: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-dark-900 p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Download className="text-primary-500" />
          Export Video
        </h1>
        <p className="text-dark-400">Select time range and format for export.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Export Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Export Configuration</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-dark-400 font-medium">Start Time</label>
                <input type="datetime-local" className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-dark-400 font-medium">End Time</label>
                <input type="datetime-local" className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-dark-400 font-medium">Format</label>
              <select className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-sm text-white outline-none">
                <option>MP4 (H.264)</option>
                <option>MKV (Matroska)</option>
                <option>AVI (Legacy)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="watermark" className="rounded border-dark-600 bg-dark-900 text-primary-600" />
              <label htmlFor="watermark" className="text-sm text-white">Include Watermark</label>
            </div>

            <button className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-colors mt-6">
              Start Export
            </button>
          </div>
        </div>

        {/* Recent Exports */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Exports</h2>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-dark-800 p-3 rounded-lg border border-dark-700 flex items-center gap-3">
                <FileVideo className="text-primary-400" size={24} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">Export_{i}.mp4</div>
                  <div className="text-[10px] text-dark-500">Completed • 45MB</div>
                </div>
                <button className="p-1.5 hover:bg-dark-700 rounded text-dark-400"><Download size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PREMIUM EXPORT MANAGER
// High-performance video extraction and transcoding unit
// ============================================================================

import React, { useState } from 'react';
import {
  Download,
  Clock,
  Settings,
  FileVideo,
  ShieldCheck,
  Zap,
  LayoutTemplate,
  Calendar,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { ExportProgress, ExportJob } from './export-progress';

export const ExportManager: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [jobs, setJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Front Entrance - Intrusion Event',
      status: 'processing',
      progress: 45,
      totalSize: 1024 * 1024 * 250, // 250MB
      processedSize: 1024 * 1024 * 112,
      startTime: new Date(Date.now() - 300000),
    }
  ]);

  const handleStartExport = () => {
    // In a real app, this would call the API
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-dark-950 overflow-hidden">
      {/* Premium Header */}
      <div className="p-8 bg-dark-900/50 backdrop-blur-2xl border-b border-white/5 flex flex-col gap-8 z-10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-600 rounded-2xl shadow-xl shadow-primary-500/20">
                <Download size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none">Export Terminal</h1>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.3em] mt-2">Secure Media Extraction Protocol</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Storage Capacity</span>
              <span className="text-xs font-mono text-white">4.2 TB Available</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">System Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Configuration Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-dark-900/60 rounded-3xl border border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest">
                  <Settings size={18} className="text-primary-500" />
                  Extraction Parameters
                </div>
                <div className="px-3 py-1 bg-primary-600/10 rounded-full border border-primary-500/20 text-[10px] font-black text-primary-400 uppercase">
                  H.264 High Profile
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Time Range */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Clock size={12} className="text-green-500" />
                      Archive Start
                    </label>
                    <input type="datetime-local" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500/50 outline-none transition-all shadow-inner hover:bg-black/60" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Clock size={12} className="text-red-500" />
                      Archive End
                    </label>
                    <input type="datetime-local" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500/50 outline-none transition-all shadow-inner hover:bg-black/60" />
                  </div>
                </div>

                {/* Format & Optimization */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <FileVideo size={12} className="text-primary-500" />
                      Output Format
                    </label>
                    <select className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500/50 outline-none appearance-none transition-all shadow-inner cursor-pointer hover:bg-black/60">
                      <option>Universal MP4 (Recommended)</option>
                      <option>Matroska Container (MKV)</option>
                      <option>Raw Stream (TS)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Zap size={12} className="text-orange-500" />
                      Transcoding Mode
                    </label>
                    <select className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500/50 outline-none appearance-none transition-all shadow-inner cursor-pointer hover:bg-black/60">
                      <option>Hardware Accelerated (GPU)</option>
                      <option>Standard Compatibility (CPU)</option>
                      <option>Direct Copy (No Re-encode)</option>
                    </select>
                  </div>
                </div>

                {/* Security Features */}
                <div className="p-6 bg-black/40 rounded-2xl border border-white/5 shadow-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-green-500" />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Watermark Protection</p>
                        <p className="text-[10px] text-dark-500">Inject timestamp and camera ID into video stream</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LayoutTemplate size={20} className="text-blue-500" />
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-widest">Multi-Channel Layout</p>
                          <p className="text-[10px] text-dark-500">Merge all selected views into a single grid file</p>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartExport}
                  disabled={isExporting}
                  className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-primary-500/20 active:scale-[0.98] uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3"
                >
                  {isExporting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download size={20} />
                      Initialize Extraction
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Column: Active Jobs & History */}
          <div className="lg:col-span-5 space-y-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                  <Zap size={18} className="text-primary-400" />
                  Active Operations
                </h2>
                <span className="px-2 py-0.5 bg-primary-500/20 rounded text-[10px] font-black text-primary-400">{jobs.filter(j => j.status === 'processing').length} Total</span>
              </div>

              <div className="bg-dark-900/40 rounded-3xl border border-white/5 p-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <ExportProgress
                  jobs={jobs}
                  onDownload={(job) => console.log('Downloading', job.name)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                  <Calendar size={18} className="text-dark-400" />
                  Archived Exports
                </h2>
                <button className="text-[10px] text-primary-400 hover:text-white transition-colors font-bold uppercase tracking-widest">Clear History</button>
              </div>

              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-dark-900/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-white/20 transition-all">
                    <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-primary-500 shadow-inner group-hover:scale-110 transition-transform">
                      <FileVideo size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate group-hover:text-primary-400 transition-colors">ServerRoom_Sec_0{i}.mp4</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-dark-500 font-bold uppercase">2h ago</span>
                        <div className="w-1 h-1 rounded-full bg-dark-600" />
                        <span className="text-[10px] text-dark-500 font-bold uppercase">45.2 MB</span>
                      </div>
                    </div>
                    <button className="p-2.5 bg-black/40 hover:bg-primary-600 text-dark-400 hover:text-white rounded-xl transition-all shadow-inner">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PREMIUM BOOKMARKS MANAGER
// Professional video evidence and annotation hub
// ============================================================================

import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Edit2,
  Trash2,
  Calendar,
  ExternalLink,
  Tag,
  StickyNote,
  MoreVertical,
  Plus,
  Clock,
  Camera as CameraIcon,
  Share2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface BookmarkItem {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
}

export const BookmarksManager: React.FC = () => {
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const [bookmarks] = useState<BookmarkItem[]>([
    {
      id: '1',
      cameraId: 'cam-01',
      cameraName: 'Front Entrance',
      timestamp: new Date(),
      title: 'Suspicious Activity',
      description: 'Individual wearing hood loitering near the main door for 15 minutes.',
      tags: ['Security', 'Person', 'Entrance'],
    },
    {
      id: '2',
      cameraId: 'cam-02',
      cameraName: 'Parking Lot B',
      timestamp: new Date(Date.now() - 3600000),
      title: 'Vehicle Incident',
      description: 'White SUV hit a parked motorcycle and drove away without stopping.',
      tags: ['Traffic', 'Vehicle', 'Accident'],
    }
  ]);

  return (
    <div className="h-full flex flex-col bg-dark-950 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 bg-dark-900/50 backdrop-blur-xl border-b border-white/5 flex flex-col gap-6 z-10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/20">
                <Bookmark size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-widest">Evidence Hub</h1>
            </div>
            <p className="text-[10px] text-dark-400 font-bold uppercase tracking-[0.2em] ml-11 opacity-60">Verified Bookmarks & Annotations</p>
          </div>

          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95">
            <Plus size={16} />
            Create Bookmark
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by title, description or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/5 focus:border-primary-500/50 focus:bg-black/60 outline-none transition-all text-sm shadow-inner"
            />
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 rounded-lg transition-all ${activeView === 'grid' ? 'bg-primary-500 text-white shadow-lg' : 'text-dark-400 hover:text-white'}`}
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 rounded-lg transition-all ${activeView === 'list' ? 'bg-primary-500 text-white shadow-lg' : 'text-dark-400 hover:text-white'}`}
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/5">
        <div className={activeView === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {bookmarks.map(bm => (
            <div
              key={bm.id}
              className={`bg-dark-900 border border-white/5 group hover:border-primary-500/40 transition-all shadow-2xl overflow-hidden ${activeView === 'grid' ? 'rounded-2xl' : 'rounded-xl flex items-center p-2'
                }`}
            >
              {/* Visual Preview */}
              <div className={`bg-black relative ${activeView === 'grid' ? 'aspect-video' : 'w-48 aspect-video rounded-lg shrink-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CameraIcon className="w-8 h-8 text-white/10" />
                </div>
                {/* Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-primary-600/80 backdrop-blur-md rounded text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                  {bm.cameraName}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-white/80 font-mono">
                  <Clock size={10} className="text-primary-400" />
                  {format(bm.timestamp, 'HH:mm:ss')}
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button className="p-3 bg-white text-primary-600 rounded-full shadow-xl hover:scale-110 transition-all"><ExternalLink size={20} /></button>
                  <button className="p-3 bg-white text-primary-600 rounded-full shadow-xl hover:scale-110 transition-all"><Download size={20} /></button>
                </div>
              </div>

              {/* Metadata Area */}
              <div className={`p-5 flex-1 flex flex-col gap-4 ${activeView === 'list' ? 'px-6' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white font-bold group-hover:text-primary-400 transition-colors">{bm.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-dark-500 font-bold uppercase tracking-wider">
                      <Calendar size={12} className="text-primary-500/60" />
                      {format(bm.timestamp, 'MMMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-dark-400 hover:text-white transition-colors"><Edit2 size={16} /></button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-dark-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                <p className="text-xs text-dark-400 leading-relaxed italic border-l-2 border-white/5 pl-4">
                  {bm.description}
                </p>

                <div className="flex items-center gap-2 flex-wrap mt-auto">
                  <Tag size={12} className="text-dark-500" />
                  {bm.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-primary-500/5 text-primary-400 text-[10px] font-black uppercase tracking-widest border border-primary-500/20 rounded-full">
                      {tag}
                    </span>
                  ))}
                  <button className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-dark-400 hover:text-white hover:bg-white/10 transition-all">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="p-4 bg-dark-900 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">Database Sync: <span className="text-green-500">Live</span></div>
          <div className="w-px h-3 bg-white/10" />
          <div className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">Total Evidence: <span className="text-white">{bookmarks.length} Records</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all">
            <Download size={14} />
            Export All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all">
            <Share2 size={14} />
            Share Hub
          </button>
        </div>
      </div>
    </div>
  );
};

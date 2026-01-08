// ============================================================================
// BOOKMARKS MANAGER
// Create and manage video bookmarks
// ============================================================================

import React from 'react';
import { Bookmark, Search, Edit2, Trash2, Calendar } from 'lucide-react';

export const BookmarksManager: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      <div className="p-4 bg-dark-800 border-b border-dark-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bookmark className="text-primary-500" />
          Bookmarks
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="bg-dark-900 text-white pl-9 pr-4 py-1.5 rounded-lg border border-dark-600 focus:border-primary-500 outline-none transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Bookmark Card */}
          <div className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700 group hover:border-primary-500/50 transition-colors">
            <div className="aspect-video bg-black relative">
              <div className="absolute inset-0 flex items-center justify-center text-dark-600">
                Thumbnail Placeholder
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white">
                02:15:00
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">Security Breach</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:text-primary-400 text-dark-400"><Edit2 size={14} /></button>
                  <button className="p-1 hover:text-red-400 text-dark-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-dark-400 mb-4">Suspicious person near back exit.</p>
              <div className="flex items-center gap-2 text-[10px] text-dark-500">
                <Calendar size={12} />
                2024-01-05 14:30:22
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

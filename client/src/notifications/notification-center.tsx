// ============================================================================
// PREMIUM NOTIFICATION CENTER
// Central communication hub for alerts, system events and tasks
// ============================================================================

import React, { useState } from 'react';
import {
  Bell,
  X,
  Check,
  Trash2,
  Settings,
  AlertCircle,
  Info,
  Cpu,
  Activity,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type NotificationCategory = 'alert' | 'system' | 'event' | 'maintenance' | 'security';

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (notificationId: string) => void;
  onClearAll?: () => void;
  onSettings?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');

  const categories: { id: NotificationCategory, icon: any, color: string }[] = [
    { id: 'alert', icon: AlertCircle, color: 'text-red-500' },
    { id: 'system', icon: Cpu, color: 'text-blue-500' },
    { id: 'security', icon: Activity, color: 'text-purple-500' },
    { id: 'maintenance', icon: Settings, color: 'text-yellow-500' },
  ];

  const filteredNotifications =
    selectedCategory === 'all'
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  return (
    <div className="relative">
      {/* Bell Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all group ${isOpen ? 'bg-primary-600 text-white shadow-lg' : 'bg-black/20 text-dark-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Bell size={20} className={isOpen ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg border-2 border-dark-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-[420px] bg-dark-900/95 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="px-6 py-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Inbox</h3>
              <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">{unreadCount} New Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSettings}
                className="p-2 hover:bg-white/5 rounded-lg text-dark-500 hover:text-white transition-all"
                title="Notification Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-dark-500 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="px-4 py-3 bg-black/20 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'bg-black/40 text-dark-500 hover:text-white border border-white/5'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${selectedCategory === cat.id
                    ? 'bg-white/10 border-white/20 text-white shadow-lg'
                    : 'bg-black/40 border-white/5 text-dark-500 hover:text-white'
                  }`}
              >
                <cat.icon size={12} className={cat.color} />
                {cat.id}
              </button>
            ))}
          </div>

          {/* List Content */}
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 bg-black/10">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
                <Bell size={48} />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Nothing to report</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group relative p-5 transition-all hover:bg-white/5 ${!n.read ? 'bg-primary-500/[0.03]' : ''}`}
                  >
                    {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />}

                    <div className="flex gap-4">
                      <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner ${n.category === 'alert' ? 'bg-red-500/10 text-red-500' :
                          n.category === 'security' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-blue-500/10 text-blue-500'
                        }`}>
                        {n.category === 'alert' ? <AlertCircle size={20} /> : <Info size={20} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-bold truncate pr-6 ${!n.read ? 'text-white' : 'text-dark-400'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[9px] font-mono text-dark-600 shrink-0">
                            {formatDistanceToNow(n.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-dark-400 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                          {n.description}
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() => onMarkAsRead?.(n.id)}
                            className="text-[9px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-400 transition-colors"
                          >
                            Mark as read
                          </button>
                          <div className="w-1 h-1 rounded-full bg-dark-700" />
                          <button
                            onClick={() => onDelete?.(n.id)}
                            className="text-[9px] font-black uppercase tracking-widest text-dark-600 hover:text-red-500 transition-colors"
                          >
                            Delete
                          </button>
                          {n.actionUrl && (
                            <button className="ml-auto text-white group-hover:translate-x-1 transition-transform">
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-dark-950 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={onMarkAllAsRead}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-dark-300 hover:text-white transition-all border border-white/5"
            >
              Clear Workspace
            </button>
            <button
              onClick={onClearAll}
              className="text-[10px] font-black uppercase tracking-widest text-dark-500 hover:text-red-500 transition-colors px-2"
            >
              Archive All
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for click-away */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

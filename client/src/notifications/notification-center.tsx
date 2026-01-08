import React, { useState } from 'react';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type NotificationCategory = 'alert' | 'system' | 'event' | 'maintenance';

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
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>(
    'all'
  );

  const categories: NotificationCategory[] = ['alert', 'system', 'event', 'maintenance'];

  const filteredNotifications =
    selectedCategory === 'all'
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  const getCategoryColor = (category: NotificationCategory): string => {
    switch (category) {
      case 'alert':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'system':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'event':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const getCategoryLabel = (category: NotificationCategory): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="relative">
      {/* Bell icon button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {onSettings && (
                <button
                  onClick={() => {
                    onSettings();
                    setIsOpen(false);
                  }}
                  className="p-1 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-1 p-4 border-b border-dark-700 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              All
            </button>
            {categories.map((category) => {
              const count = notifications.filter((n) => n.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {getCategoryLabel(category)}
                  {count > 0 && <span className="ml-1">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-dark-400">
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-700">
                {filteredNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read && onMarkAsRead) {
                        onMarkAsRead(notification.id);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full text-left p-4 hover:bg-dark-700 transition-colors ${
                      !notification.read ? 'bg-dark-700/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category badge */}
                      <span
                        className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(
                          notification.category
                        )}`}
                      >
                        {getCategoryLabel(notification.category)}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-medium truncate ${
                              notification.read
                                ? 'text-dark-300'
                                : 'text-white font-semibold'
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-dark-400 truncate mt-1">
                          {notification.description}
                        </p>
                        <span className="text-xs text-dark-500 mt-2 block">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-1">
                        {!notification.read && onMarkAsRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="p-1 hover:bg-dark-600 rounded transition-colors text-dark-400 hover:text-primary-400"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                            className="p-1 hover:bg-dark-600 rounded transition-colors text-dark-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-dark-700 bg-dark-900">
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={() => {
                    onMarkAllAsRead();
                  }}
                  className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                >
                  Mark all as read
                </button>
              )}
              {onClearAll && (
                <button
                  onClick={() => {
                    if (confirm('Clear all notifications?')) {
                      onClearAll();
                    }
                  }}
                  className="text-sm text-dark-400 hover:text-red-400 font-medium ml-auto"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

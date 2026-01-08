import React, { useState } from 'react';
import { Trash2, Edit2, Tag, MessageSquare, Calendar, Camera } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface BookmarkData {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  notes: string;
  tags: string[];
  thumbnail?: string;
  duration?: number;
}

export interface BookmarkCardProps {
  bookmark: BookmarkData;
  onEdit?: (bookmark: BookmarkData) => void;
  onDelete?: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  onTagClick,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting || !onDelete) return;
    
    if (confirm('Delete this bookmark?')) {
      setIsDeleting(true);
      try {
        onDelete(bookmark.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden hover:border-primary-500/50 transition-colors group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Thumbnail */}
      {bookmark.thumbnail && (
        <div className="relative h-40 bg-dark-900 overflow-hidden">
          <img
            src={bookmark.thumbnail}
            alt="Bookmark thumbnail"
            className="w-full h-full object-cover"
          />
          {bookmark.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-mono">
              {Math.floor(bookmark.duration / 60)}m {Math.floor(bookmark.duration % 60)}s
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-4 h-4 text-dark-500 flex-shrink-0" />
              <span className="text-sm text-dark-300 truncate">
                {bookmark.cameraName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-dark-500 flex-shrink-0" />
              <span className="text-xs text-dark-400">
                {formatTime(bookmark.timestamp)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {showActions && (
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(bookmark)}
                  className="p-1.5 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-primary-400"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-dark-400 hover:text-red-400 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        {bookmark.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-dark-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">Notes</span>
            </div>
            <p className="text-sm text-dark-300 line-clamp-2">
              {bookmark.notes}
            </p>
          </div>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-dark-400">
              <Tag className="w-4 h-4" />
              <span className="text-xs font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="px-2 py-1 bg-primary-500/20 border border-primary-500/50 rounded text-xs text-primary-300 hover:bg-primary-500/30 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

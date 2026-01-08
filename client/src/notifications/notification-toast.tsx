import React, { useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
}) => {
  useEffect(() => {
    if (duration <= 0) return;

    const timeout = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timeout);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
    }
  };

  return (
    <div className="animate-in slide-in-from-right-full duration-300">
      <div
        className={`rounded-lg border overflow-hidden shadow-lg ${getColor()}`}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{title}</h3>
            {message && (
              <p className="text-sm opacity-90 line-clamp-2">{message}</p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="text-sm font-medium mt-2 hover:opacity-80 transition-opacity underline"
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => onClose(id)}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors opacity-75 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className={`h-1 ${getProgressColor()} animate-pulse`} />
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface HealthAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  cameraId?: string;
  cameraName?: string;
  timestamp: Date;
  resolved?: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface HealthAlertsPanelProps {
  alerts: HealthAlert[];
  onAcknowledge?: (alertId: string) => Promise<void>;
  onResolve?: (alertId: string) => Promise<void>;
  onDismiss?: (alertId: string) => void;
  maxVisibleAlerts?: number;
}

export const HealthAlertsPanel: React.FC<HealthAlertsPanelProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onDismiss,
  maxVisibleAlerts = 10,
}) => {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [actionInProgress, setActionInProgress] = useState<string>('');

  const toggleExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const visibleAlerts = alerts.slice(0, maxVisibleAlerts);
  const hiddenAlertsCount = alerts.length - visibleAlerts.length;

  const handleAction = async (
    action: () => Promise<void>,
    alertId: string
  ) => {
    setActionInProgress(alertId);
    try {
      await action();
    } finally {
      setActionInProgress('');
    }
  };

  const getSeverityIcon = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getSeverityColor = (severity: HealthAlert['severity']): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-white font-medium">All systems healthy</p>
        <p className="text-dark-400 text-sm mt-1">No alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Alert summary */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-white font-medium">System Alerts</h3>
            <p className="text-sm text-dark-400">
              {alerts.filter((a) => !a.resolved).length} active alert(s)
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-3 justify-end">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-dark-300">
                  {alerts.filter((a) => a.severity === 'critical' && !a.resolved).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-dark-300">
                  {alerts.filter((a) => a.severity === 'warning' && !a.resolved).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {visibleAlerts.map((alert) => {
          const isExpanded = expandedAlerts.has(alert.id);

          return (
            <div
              key={alert.id}
              className={`rounded-lg border transition-colors ${getSeverityColor(
                alert.severity
              )} ${alert.resolved ? 'opacity-50' : ''}`}
            >
              {/* Alert header */}
              <button
                onClick={() => toggleExpanded(alert.id)}
                className="w-full flex items-start gap-3 p-4 hover:bg-white/5 transition-colors text-left"
              >
                {getSeverityIcon(alert.severity)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{alert.title}</h4>
                    {alert.resolved && (
                      <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-300 rounded">
                        Resolved
                      </span>
                    )}
                    {alert.acknowledgedAt && !alert.resolved && (
                      <span className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded">
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-inherit opacity-90 truncate">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-75">
                    {alert.cameraName && (
                      <>
                        <span>{alert.cameraName}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Dismiss button */}
                {onDismiss && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(alert.id);
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-current opacity-50 px-4 py-3 space-y-3">
                  {/* Full description */}
                  <p className="text-sm">{alert.description}</p>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs opacity-75">
                    {alert.cameraName && (
                      <p>
                        <strong>Camera:</strong> {alert.cameraName}
                      </p>
                    )}
                    <p>
                      <strong>Timestamp:</strong>{' '}
                      {alert.timestamp.toLocaleString()}
                    </p>
                    {alert.acknowledgedAt && (
                      <p>
                        <strong>Acknowledged:</strong> {alert.acknowledgedAt.toLocaleString()}
                        {alert.acknowledgedBy && ` by ${alert.acknowledgedBy}`}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  {!alert.resolved && (
                    <div className="flex gap-2 pt-2 border-t border-current opacity-75">
                      {!alert.acknowledgedAt && onAcknowledge && (
                        <button
                          onClick={() =>
                            handleAction(() => onAcknowledge(alert.id), alert.id)
                          }
                          disabled={actionInProgress === alert.id}
                          className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded font-medium transition-colors text-sm"
                        >
                          Acknowledge
                        </button>
                      )}
                      {onResolve && (
                        <button
                          onClick={() =>
                            handleAction(() => onResolve(alert.id), alert.id)
                          }
                          disabled={actionInProgress === alert.id}
                          className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 text-green-300 rounded font-medium transition-colors text-sm"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more indicator */}
      {hiddenAlertsCount > 0 && (
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center text-dark-400 text-sm">
          +{hiddenAlertsCount} more alert{hiddenAlertsCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Download, Pause, Play } from 'lucide-react';

export interface ExportJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  totalSize: number;
  processedSize: number;
  startTime: Date;
  estimatedEndTime?: Date;
  error?: string;
  downloadUrl?: string;
}

export interface ExportProgressProps {
  jobs: ExportJob[];
  onPause?: (jobId: string) => Promise<void>;
  onResume?: (jobId: string) => Promise<void>;
  onCancel?: (jobId: string) => Promise<void>;
  onDownload?: (job: ExportJob) => void;
  onRetry?: (jobId: string) => Promise<void>;
}

export const ExportProgress: React.FC<ExportProgressProps> = ({
  jobs,
  onPause,
  onResume,
  onCancel,
  onDownload,
  onRetry,
}) => {
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [actionInProgress, setActionInProgress] = useState<string>('');

  const toggleExpanded = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return (
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <AlertCircle className="w-5 h-5 text-dark-400" />;
    }
  };

  const getStatusColor = (status: ExportJob['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'processing':
        return 'text-primary-500';
      case 'failed':
        return 'text-red-500';
      case 'cancelled':
        return 'text-yellow-500';
      default:
        return 'text-dark-400';
    }
  };

  const handleAction = async (
    action: () => Promise<void>,
    jobId: string
  ) => {
    setActionInProgress(jobId);
    try {
      await action();
    } finally {
      setActionInProgress('');
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-dark-400">
        <p>No export jobs</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const elapsedTime = new Date().getTime() - job.startTime.getTime();
        const isExpanded = expandedJobs.has(job.id);
        const remainingSize = job.totalSize - job.processedSize;
        const speedBytesPerMs = job.progress > 0 ? job.processedSize / elapsedTime : 0;
        const estimatedRemainingMs = speedBytesPerMs > 0 ? remainingSize / speedBytesPerMs : 0;

        return (
          <div
            key={job.id}
            className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden hover:border-primary-500/50 transition-colors"
          >
            {/* Header */}
            <button
              onClick={() => toggleExpanded(job.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-dark-700 transition-colors text-left"
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(job.status)}
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{job.name}</h4>
                <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                  <span className={getStatusColor(job.status)}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  {job.status === 'processing' && (
                    <>
                      <span>•</span>
                      <span>
                        {formatFileSize(job.processedSize)} / {formatFileSize(job.totalSize)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress percentage */}
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-bold text-white">{job.progress}%</div>
                {job.status === 'processing' && estimatedRemainingMs > 0 && (
                  <div className="text-xs text-dark-400">
                    {formatDuration(estimatedRemainingMs)} remaining
                  </div>
                )}
              </div>
            </button>

            {/* Progress bar */}
            <div className="px-4 pb-3">
              <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    job.status === 'completed'
                      ? 'bg-green-500'
                      : job.status === 'failed'
                      ? 'bg-red-500'
                      : 'bg-primary-500'
                  }`}
                  style={{ width: `${Math.min(job.progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Expandable content */}
            {isExpanded && (
              <div className="border-t border-dark-700 p-4 space-y-4 bg-dark-900">
                {/* Detailed stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-dark-400 text-xs">Total Size</p>
                    <p className="text-white font-medium">
                      {formatFileSize(job.totalSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-dark-400 text-xs">Processed</p>
                    <p className="text-white font-medium">
                      {formatFileSize(job.processedSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-dark-400 text-xs">Elapsed Time</p>
                    <p className="text-white font-medium">
                      {formatDuration(elapsedTime)}
                    </p>
                  </div>
                  {job.estimatedEndTime && job.status === 'processing' && (
                    <div>
                      <p className="text-dark-400 text-xs">Est. Completion</p>
                      <p className="text-white font-medium">
                        {job.estimatedEndTime.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {job.error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-300">
                    {job.error}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t border-dark-700">
                  {job.status === 'processing' && (
                    <>
                      {onPause && (
                        <button
                          onClick={() =>
                            handleAction(() => onPause(job.id), job.id)
                          }
                          disabled={actionInProgress === job.id}
                          className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-50 text-yellow-400 rounded font-medium transition-colors text-sm"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      )}
                      {onCancel && (
                        <button
                          onClick={() =>
                            handleAction(() => onCancel(job.id), job.id)
                          }
                          disabled={actionInProgress === job.id}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 rounded font-medium transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}

                  {job.status === 'pending' && onResume && (
                    <button
                      onClick={() =>
                        handleAction(() => onResume(job.id), job.id)
                      }
                      disabled={actionInProgress === job.id}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded font-medium transition-colors text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}

                  {job.status === 'completed' && job.downloadUrl && onDownload && (
                    <button
                      onClick={() => onDownload(job)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}

                  {job.status === 'failed' && onRetry && (
                    <button
                      onClick={() =>
                        handleAction(() => onRetry(job.id), job.id)
                      }
                      disabled={actionInProgress === job.id}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded font-medium transition-colors text-sm"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface EventFilterOptions {
  selectedTypes: string[];
  selectedCameras: string[];
  selectedSeverity: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: 'all' | 'acknowledged' | 'unacknowledged';
}

export interface EventFilterProps {
  eventTypes: string[];
  cameras: Array<{ id: string; name: string }>;
  onFilterChange: (filter: EventFilterOptions) => void;
  initialFilter?: Partial<EventFilterOptions>;
}

export const EventFilter: React.FC<EventFilterProps> = ({
  eventTypes,
  cameras,
  onFilterChange,
  initialFilter = {},
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<EventFilterOptions>({
    selectedTypes: initialFilter.selectedTypes || [],
    selectedCameras: initialFilter.selectedCameras || [],
    selectedSeverity: initialFilter.selectedSeverity || [],
    dateRange: initialFilter.dateRange || { start: null, end: null },
    status: initialFilter.status || 'all',
  });

  const handleTypeToggle = (type: string) => {
    const updated = filter.selectedTypes.includes(type)
      ? filter.selectedTypes.filter((t) => t !== type)
      : [...filter.selectedTypes, type];
    
    const newFilter = { ...filter, selectedTypes: updated };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleCameraToggle = (cameraId: string) => {
    const updated = filter.selectedCameras.includes(cameraId)
      ? filter.selectedCameras.filter((c) => c !== cameraId)
      : [...filter.selectedCameras, cameraId];
    
    const newFilter = { ...filter, selectedCameras: updated };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSeverityToggle = (severity: string) => {
    const updated = filter.selectedSeverity.includes(severity)
      ? filter.selectedSeverity.filter((s) => s !== severity)
      : [...filter.selectedSeverity, severity];
    
    const newFilter = { ...filter, selectedSeverity: updated };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleStatusChange = (status: EventFilterOptions['status']) => {
    const newFilter = { ...filter, status };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleClearAll = () => {
    const emptyFilter: EventFilterOptions = {
      selectedTypes: [],
      selectedCameras: [],
      selectedSeverity: [],
      dateRange: { start: null, end: null },
      status: 'all',
    };
    setFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  const hasActiveFilters =
    filter.selectedTypes.length > 0 ||
    filter.selectedCameras.length > 0 ||
    filter.selectedSeverity.length > 0 ||
    filter.status !== 'all' ||
    filter.dateRange.start ||
    filter.dateRange.end;

  const severityOptions = ['Critical', 'High', 'Medium', 'Low', 'Info'];
  const severityColors: Record<string, string> = {
    Critical: 'bg-red-500',
    High: 'bg-orange-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-blue-500',
    Info: 'bg-green-500',
  };

  return (
    <div className="w-full bg-dark-800 rounded-lg border border-dark-700">
      {/* Filter header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-primary-500/20 border border-primary-500/50 rounded text-xs text-primary-300 font-medium">
              {filter.selectedTypes.length +
                filter.selectedCameras.length +
                filter.selectedSeverity.length}
              active
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-dark-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Filter content */}
      {expanded && (
        <div className="border-t border-dark-700 p-4 space-y-4">
          {/* Event Types */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Event Types</h3>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter.selectedTypes.includes(type)
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Cameras */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Cameras</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {cameras.map((camera) => (
                <label key={camera.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.selectedCameras.includes(camera.id)}
                    onChange={() => handleCameraToggle(camera.id)}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="text-sm text-dark-300">{camera.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Severity</h3>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map((severity) => (
                <button
                  key={severity}
                  onClick={() => handleSeverityToggle(severity)}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter.selectedSeverity.includes(severity)
                      ? 'bg-dark-600 border border-primary-500'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${severityColors[severity]}`}
                  />
                  {severity}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Status</h3>
            <select
              value={filter.status}
              onChange={(e) => handleStatusChange(e.target.value as EventFilterOptions['status'])}
              className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Events</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="unacknowledged">Unacknowledged</option>
            </select>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

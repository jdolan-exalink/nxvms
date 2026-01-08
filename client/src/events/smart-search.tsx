import React, { useState, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface SearchFilter {
  query: string;
  eventTypes: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  severity: 'all' | 'critical' | 'warning' | 'info';
}

export interface SmartSearchProps {
  onSearch: (filter: SearchFilter) => void;
  onClear: () => void;
  isLoading?: boolean;
  eventTypes?: string[];
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  onSearch,
  onClear,
  isLoading = false,
  eventTypes = ['motion', 'alarm', 'tamper', 'system'],
}) => {
  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    eventTypes: [],
    dateRange: { start: null, end: null },
    severity: 'all',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = useCallback(() => {
    onSearch(filter);
  }, [filter, onSearch]);

  const handleClear = useCallback(() => {
    const emptyFilter: SearchFilter = {
      query: '',
      eventTypes: [],
      dateRange: { start: null, end: null },
      severity: 'all',
    };
    setFilter(emptyFilter);
    onClear();
  }, [onClear]);

  const toggleEventType = (type: string) => {
    setFilter((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter((t) => t !== type)
        : [...prev.eventTypes, type],
    }));
  };

  const hasActiveFilters =
    filter.query ||
    filter.eventTypes.length > 0 ||
    filter.severity !== 'all' ||
    filter.dateRange.start ||
    filter.dateRange.end;

  return (
    <div className="w-full bg-dark-800 rounded-lg border border-dark-700 p-4 space-y-3">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search events by keyword, camera, or description..."
            value={filter.query}
            onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 pl-10 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>

        {/* Advanced filter toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 hover:bg-dark-700 rounded transition-colors text-white hover:text-primary-400"
          title="Advanced filters"
        >
          <Filter className="w-5 h-5" />
        </button>

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="p-2 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white"
            title="Clear filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="space-y-3 border-t border-dark-700 pt-3">
          {/* Event type filter */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Event Types
            </label>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleEventType(type)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter.eventTypes.includes(type)
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Severity filter */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Severity
            </label>
            <select
              value={filter.severity}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  severity: e.target.value as SearchFilter['severity'],
                }))
              }
              className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Date range filter */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={
                  filter.dateRange.start
                    ? filter.dateRange.start.toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      start: e.target.value ? new Date(e.target.value) : null,
                    },
                  }))
                }
                className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                End Date
              </label>
              <input
                type="datetime-local"
                value={
                  filter.dateRange.end
                    ? filter.dateRange.end.toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      end: e.target.value ? new Date(e.target.value) : null,
                    },
                  }))
                }
                className="w-full bg-dark-900 border border-dark-700 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filter.query && (
            <div className="px-3 py-1 bg-primary-500/20 border border-primary-500/50 rounded text-sm text-primary-300 flex items-center gap-2">
              <span>{filter.query}</span>
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => setFilter((prev) => ({ ...prev, query: '' }))}
              />
            </div>
          )}
          {filter.eventTypes.map((type) => (
            <div
              key={type}
              className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-sm text-blue-300 flex items-center gap-2"
            >
              <span>{type}</span>
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => toggleEventType(type)}
              />
            </div>
          ))}
          {filter.severity !== 'all' && (
            <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-sm text-orange-300 flex items-center gap-2">
              <span>{filter.severity}</span>
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => setFilter((prev) => ({ ...prev, severity: 'all' }))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

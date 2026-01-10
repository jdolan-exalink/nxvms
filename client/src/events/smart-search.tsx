// ============================================================================
// PREMIUM SMART SEARCH
// Intelligent event filtering with modern, glassmorphic UI
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  Search,
  X,
  Filter,
  Calendar,
  ShieldAlert,
  ChevronDown,
  Activity,
  Clock,
  Tag
} from 'lucide-react';

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
  eventTypes = ['motion', 'alarm', 'tamper', 'system', 'line-crossing', 'face-detection'],
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
    <div className="w-full bg-dark-900/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Search Header Area */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 group-focus-within:text-primary-400 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search for events, cameras, or alerts..."
              value={filter.query}
              onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 pl-12 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:bg-black/60 transition-all shadow-inner"
              disabled={isLoading}
            />
            {filter.query && (
              <button
                onClick={() => setFilter(p => ({ ...p, query: '' }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${showAdvanced
                ? 'bg-primary-500 border-primary-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-black/40 border-white/5 text-dark-300 hover:text-white hover:bg-white/5'
              }`}
          >
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Filters</span>
          </button>
        </div>

        {/* Quick Filter Tags (Visible when advanced is closed) */}
        {!showAdvanced && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[10px] font-bold text-dark-400 uppercase tracking-tighter">
              <Activity size={10} />
              Quick Actions:
            </div>
            {['critical', 'motion', 'tamper'].map(q => (
              <button
                key={q}
                onClick={() => toggleEventType(q)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${filter.eventTypes.includes(q)
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                    : 'bg-black/20 border-white/5 text-dark-400 hover:border-white/10 hover:text-white'
                  }`}
              >
                {q.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="p-4 bg-black/40 border-t border-white/5 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Types */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-dark-400 uppercase tracking-widest px-1">
                <ShieldAlert size={12} className="text-primary-500" />
                Type Identification
              </div>
              <div className="grid grid-cols-2 gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleEventType(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left flex items-center justify-between ${filter.eventTypes.includes(type)
                        ? 'bg-primary-500/20 border-primary-500 text-white'
                        : 'bg-black/20 border-white/5 text-dark-400 hover:bg-white/5 hover:text-dark-200'
                      }`}
                  >
                    <span className="capitalize">{type.replace('-', ' ')}</span>
                    {filter.eventTypes.includes(type) && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity & Metrics */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-dark-400 uppercase tracking-widest px-1">
                <Activity size={12} className="text-red-500" />
                Priority Level
              </div>
              <div className="flex flex-col gap-2">
                {['all', 'critical', 'warning', 'info'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(p => ({ ...p, severity: s as any }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-3 ${filter.severity === s
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-black/20 border-white/5 text-dark-400 hover:bg-white/5'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${s === 'critical' ? 'bg-red-500' :
                        s === 'warning' ? 'bg-yellow-500' :
                          s === 'info' ? 'bg-blue-500' : 'bg-dark-600'
                      }`} />
                    <span className="capitalize">{s} Severity</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-dark-400 uppercase tracking-widest px-1">
                <Clock size={12} className="text-green-500" />
                Temporal Scope
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-dark-500 ml-1">Archive Start</span>
                  <input
                    type="datetime-local"
                    value={filter.dateRange.start ? filter.dateRange.start.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFilter(p => ({ ...p, dateRange: { ...p.dateRange, start: e.target.value ? new Date(e.target.value) : null } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-dark-500 ml-1">Archive End</span>
                  <input
                    type="datetime-local"
                    value={filter.dateRange.end ? filter.dateRange.end.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFilter(p => ({ ...p, dateRange: { ...p.dateRange, end: e.target.value ? new Date(e.target.value) : null } }))}
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 text-xs font-bold text-dark-400 hover:text-white transition-colors"
            >
              <X size={16} />
              Reset All Filters
            </button>
            <button
              onClick={() => {
                handleSearch();
                setShowAdvanced(false);
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95"
            >
              {isLoading ? 'Processing...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      )}

      {/* Active Tags Summary */}
      {hasActiveFilters && !showAdvanced && (
        <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] font-bold text-dark-500 uppercase flex items-center mr-1">Active:</span>
            {filter.eventTypes.map(t => (
              <div key={t} className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-500/10 border border-primary-500/30 rounded text-xs text-primary-400">
                {t}
                <button onClick={() => toggleEventType(t)} className="hover:text-white"><X size={12} /></button>
              </div>
            ))}
          </div>
          <button onClick={handleClear} className="text-[10px] text-dark-400 hover:text-red-400 underline underline-offset-4">Clear All</button>
        </div>
      )}
    </div>
  );
};

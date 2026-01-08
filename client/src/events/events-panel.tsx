// ============================================================================
// EVENTS PANEL
// Display and filter system/camera events
// ============================================================================

import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  type: 'motion' | 'system' | 'alarm' | 'health';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  cameraId?: string;
  cameraName?: string;
  acknowledged: boolean;
}

const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    type: 'motion',
    severity: 'info',
    title: 'Motion Detected',
    message: 'Motion detected in Zone 1',
    timestamp: new Date().toISOString(),
    cameraId: 'cam-1',
    cameraName: 'Front Door',
    acknowledged: false,
  },
  {
    id: 'e2',
    type: 'alarm',
    severity: 'critical',
    title: 'Intrusion Alarm',
    message: 'Unauthorized entry detected in restricted area',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    cameraId: 'cam-2',
    cameraName: 'Warehouse',
    acknowledged: true,
  },
  {
    id: 'e3',
    type: 'system',
    severity: 'warning',
    title: 'Storage Warning',
    message: 'Storage pool is 90% full',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    acknowledged: false,
  },
];

export const EventsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert size={18} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-red-500';
      case 'warning': return 'border-l-4 border-yellow-500';
      default: return 'border-l-4 border-blue-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      {/* Search and Filter */}
      <div className="p-4 bg-dark-800 border-b border-dark-700 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full bg-dark-900 text-white pl-10 pr-4 py-2 rounded-lg border border-dark-600 focus:border-primary-500 outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-sm text-dark-300 transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <select 
            className="bg-dark-700 text-dark-300 text-sm border border-dark-600 rounded-lg px-3 py-2 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning & Critical</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {MOCK_EVENTS.map(event => (
          <div 
            key={event.id}
            className={`bg-dark-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getSeverityClass(event.severity)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {getSeverityIcon(event.severity)}
                <span className="font-semibold text-white">{event.title}</span>
              </div>
              <span className="text-xs text-dark-400">{format(new Date(event.timestamp), 'HH:mm:ss')}</span>
            </div>
            <p className="text-sm text-dark-300 mb-3">{event.message}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-dark-400">
                {event.cameraName ? `Camera: ${event.cameraName}` : 'System'}
              </span>
              <div className="flex items-center gap-2">
                {event.acknowledged ? (
                  <span className="flex items-center gap-1 text-green-500 font-medium">
                    <CheckCircle size={14} />
                    Acknowledged
                  </span>
                ) : (
                  <button className="px-3 py-1 bg-primary-600/20 hover:bg-primary-600 text-primary-400 hover:text-white rounded border border-primary-600/50 transition-colors">
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

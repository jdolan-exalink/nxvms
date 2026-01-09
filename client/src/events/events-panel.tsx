// ============================================================================
// EVENTS PANEL
// Display and filter system/camera events
// ============================================================================

import React, { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, Info, ShieldAlert, CheckCircle, RefreshCcw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getApiClient } from "../shared/api-client";
import { Event } from "../shared/types";

export const EventsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiClient = getApiClient();
      const response = await apiClient.getEvents({ limit: 50 });
      setEvents(response.items || []);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <ShieldAlert size={18} className="text-red-500" />;
      case "warning": return <AlertTriangle size={18} className="text-yellow-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical": return "border-l-4 border-red-500";
      case "warning": return "border-l-4 border-yellow-500";
      default: return "border-l-4 border-blue-500";
    }
  };

  const filteredEvents = events.filter(event => {
    const title = event.title || event.type || "";
    const message = event.message || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || event.severity === filter || event.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      {/* Search and Filter */}
      <div className="p-4 bg-dark-800 border-b border-dark-700 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full bg-dark-950 border border-dark-600 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="bg-dark-950 border border-dark-600 rounded-md py-2 px-4 text-sm focus:outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <button 
            onClick={fetchEvents}
            className="p-2 bg-dark-700 hover:bg-dark-600 rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-dark-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-dark-400">
            <Info className="w-8 h-8 mb-2" />
            <p>No events found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`bg-dark-800 rounded-lg p-4 border border-dark-700 shadow-sm hover:border-dark-500 transition-colors ${getSeverityClass(event.severity || "info")}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getSeverityIcon(event.severity || "info")}</div>
                    <div>
                      <h4 className="font-medium text-dark-100">{event.title || (event.type ? event.type.toUpperCase() : "EVENT")}</h4>
                      <p className="text-sm text-dark-400 mt-1">{event.message}</p>
                      <div className="flex gap-4 mt-2">
                        {event.cameraName && (
                          <span className="text-xs text-dark-500 flex items-center gap-1">
                            <Filter size={12} /> {event.cameraName}
                          </span>
                        )}
                        <span className="text-xs text-dark-500">
                          {format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss")}
                        </span>
                      </div>
                      
                      {event.metadata?.hasSnapshot && (
                        <div className="mt-3 relative group overflow-hidden rounded-md border border-dark-600 w-full max-w-sm aspect-video bg-dark-900">
                          <img 
                            src={`${getApiClient().getBaseURL()}frigate/proxy/${event.serverId || 'local'}/api/events/${event.metadata.externalId}/snapshot.jpg`} 
                            alt="Event Snapshot"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {!event.acknowledged && (
                    <button className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition-colors">
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

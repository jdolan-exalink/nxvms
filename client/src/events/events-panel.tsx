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
                className={`bg-dark-800 rounded-lg overflow-hidden border border-dark-700 shadow-sm hover:border-dark-500 transition-all group ${getSeverityClass(event.severity || "info")}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail / Map Section */}
                  <div className="w-full md:w-48 lg:w-64 bg-dark-950 flex-shrink-0 relative group">
                    {event.metadata?.hasSnapshot ? (
                      <img
                        src={`${getApiClient().getBaseURL()}frigate/proxy/${event.serverId || 'local'}/api/events/${event.metadata.externalId}/snapshot.jpg`}
                        alt="Event Snapshot"
                        className="w-full h-full object-cover aspect-video md:aspect-auto md:h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=No+Snapshot';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center min-h-[120px] text-dark-600">
                        <Info size={32} strokeWidth={1} />
                        <span className="text-[10px] uppercase mt-2">No Image</span>
                      </div>
                    )}

                    {/* Engine Badge Overlay */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] text-white/80 font-mono uppercase">
                      {event.engine || 'system'}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getSeverityIcon(event.severity || "info")}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-dark-100 uppercase tracking-tight">
                              {event.title || (event.type ? event.type.replace(/_/g, ' ') : "EVENT")}
                            </h4>
                            <span className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-dark-400 font-bold uppercase">
                              {event.category || 'general'}
                            </span>
                          </div>

                          <p className="text-sm text-dark-300 mt-1 leading-relaxed">{event.message}</p>

                          {/* AI Attributes Badges */}
                          {Object.keys(event.attributes || {}).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {event.attributes?.plate && (
                                <div className="flex flex-col">
                                  <span className="text-[8px] text-dark-500 uppercase font-black">License Plate</span>
                                  <div className="px-3 py-1 bg-yellow-400 text-black font-mono font-black rounded-sm border-b-2 border-yellow-600">
                                    {event.attributes.plate}
                                  </div>
                                </div>
                              )}
                              {event.attributes?.speed && (
                                <div className="flex flex-col">
                                  <span className="text-[8px] text-dark-500 uppercase font-black">Speed</span>
                                  <div className="px-3 py-1 bg-blue-600 text-white font-mono font-bold rounded-sm">
                                    {event.attributes.speed} km/h
                                  </div>
                                </div>
                              )}
                              {event.attributes?.label && !event.attributes.plate && (
                                <div className="px-2 py-1 bg-dark-700 text-primary-400 text-xs rounded border border-primary-500/20">
                                  {event.attributes.label}: {Math.round(event.attributes.score * 100)}%
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-dark-700/50">
                            {event.cameraName && (
                              <div className="flex flex-col">
                                <span className="text-[8px] text-dark-500 uppercase font-black">Camera</span>
                                <span className="text-xs text-dark-200 flex items-center gap-1.5 font-medium">
                                  <Filter size={12} className="text-primary-500" /> {event.cameraName}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-[8px] text-dark-500 uppercase font-black">Time Captured</span>
                              <span className="text-xs text-dark-400 font-mono">
                                {format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!event.acknowledged && (
                          <button className="text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all">
                            ACKNOWLEDGE
                          </button>
                        )}
                        <button className="text-[10px] font-black uppercase tracking-widest bg-dark-700 text-dark-300 px-3 py-1.5 rounded border border-transparent hover:border-dark-500 transition-all opacity-0 group-hover:opacity-100">
                          VIEW RECORDING
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

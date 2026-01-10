// ============================================================================
// PREMIUM HEALTH DASHBOARD
// Real-time infrastructure monitoring and diagnostics
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  Wifi,
  Thermometer,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Fan,
  Download,
  Upload,
  Clock,
  RefreshCw
} from 'lucide-react';

export const HealthDashboard: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const metrics = [
    { label: 'System Core', value: '45.2%', sub: 'Load Average: 1.2', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Volatile RAM', value: '8.4 GB', sub: 'Cache: 2.1 GB', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Thermal Info', value: '42°C', sub: 'Fan Speed: 2100 RPM', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Bandwidth', value: '450 Mbps', sub: 'Ingest: 18 cams', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const storagePools = [
    { name: 'Primary Archive Cluster', total: 10000, used: 6500, type: 'RAID-6', health: 98 },
    { name: 'Motion Buffer (Flash)', total: 1000, used: 120, type: 'NVMe', health: 100 },
    { name: 'Object Metadata DB', total: 500, used: 450, type: 'SSD', health: 85 },
  ];

  return (
    <div className="h-full flex flex-col bg-dark-950 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
      {/* Dynamic Header */}
      <div className="p-8 bg-dark-900/50 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 rounded-2xl shadow-xl shadow-green-500/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none">Diagnostic Center</h1>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-[0.3em] mt-2">All Nodes Operational • High Precision Monitored</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Telemetry Live</span>
            <span className="text-xs font-mono text-white/60">Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <button className="p-3 bg-black/40 hover:bg-white/5 rounded-2xl border border-white/5 transition-all group">
            <RefreshCw size={20} className="text-primary-500 group-hover:rotate-180 transition-transform duration-700" />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-10 max-w-7xl mx-auto w-full">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-dark-900/60 rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-primary-500/30 transition-all">
              <div className={`absolute top-0 right-0 w-24 h-24 ${m.bg} rounded-bl-[100px] -mr-8 -mt-8 opacity-20 group-hover:scale-125 transition-transform`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-2.5 ${m.bg} rounded-xl`}>
                    <m.icon className={m.color} size={22} />
                  </div>
                  <Activity className="text-dark-700" size={16} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">{m.label}</span>
                  <span className="text-2xl font-black text-white">{m.value}</span>
                  <span className="text-[10px] text-dark-400 font-bold mt-1 opacity-60">{m.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Storage & Networking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Storage Architecture */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <Database size={18} className="text-primary-500" />
                Storage Topology
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {storagePools.map((pool, i) => (
                <div key={i} className="bg-dark-900/60 rounded-3xl p-6 border border-white/5 shadow-xl hover:bg-dark-900 transition-colors">
                  <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pool.name}</span>
                        <span className="px-2 py-0.5 bg-black/40 rounded text-[9px] font-black text-dark-400 border border-white/5 uppercase">{pool.type}</span>
                      </div>
                      <span className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">Health Level: <span className={pool.health > 90 ? 'text-green-500' : 'text-yellow-500'}>{pool.health}%</span></span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-primary-400 font-bold">{(pool.used / 1024).toFixed(1)} TB</span>
                      <span className="text-xs text-dark-500 mx-1">/</span>
                      <span className="text-xs font-mono text-dark-400">{(pool.total / 1024).toFixed(1)} TB</span>
                    </div>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden p-[2px]">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${(pool.used / pool.total) > 0.9 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          (pool.used / pool.total) > 0.7 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            'bg-gradient-to-r from-primary-500 to-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                        }`}
                      style={{ width: `${(pool.used / pool.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recorder Hub */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <Server size={18} className="text-primary-500" />
                Recorder Cluster
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-dark-900/60 p-6 rounded-3xl border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary-500 opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
                    <Server size={32} className="text-primary-500 relative z-10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-white">Edge-Node-01</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Running v0.1.3</span>
                    </div>
                    <span className="text-[10px] text-dark-500 font-mono">192.168.1.120:8000</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center gap-1 group hover:border-blue-500/30 transition-all">
                    <Download size={14} className="text-blue-500" />
                    <span className="text-[9px] font-black text-dark-500 uppercase">Incoming</span>
                    <span className="text-xs font-mono font-bold text-white">420 MB/s</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center gap-1 group hover:border-green-500/30 transition-all">
                    <Upload size={14} className="text-green-500" />
                    <span className="text-[9px] font-black text-dark-500 uppercase">Outgoing</span>
                    <span className="text-xs font-mono font-bold text-white">18.5 MB/s</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Active Threads</span>
                    <span className="text-[10px] font-mono text-primary-400">12 Ready</span>
                  </div>
                  <div className="flex gap-1.5 h-1">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`flex-1 rounded-full ${i < 8 ? 'bg-primary-500/60' : 'bg-dark-800'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Diagnostics Feed */}
        <div className="bg-dark-900/60 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="px-8 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-widest">
              <Activity size={16} className="text-orange-500" />
              Live System Telemetry
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-dark-400 uppercase">Critical (0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-[10px] font-bold text-dark-400 uppercase">Warning (2)</span>
              </div>
            </div>
          </div>
          <div className="p-2 h-48 overflow-y-auto font-mono text-[11px] scrollbar-thin scrollbar-thumb-white/5">
            <div className="flex items-center gap-4 p-2 hover:bg-white/5 rounded transition-colors group">
              <span className="text-dark-600">[{format(new Date(), 'HH:mm:ss.SSS')}]</span>
              <span className="text-green-500 uppercase font-black">INFO</span>
              <span className="text-dark-300">Disk group 'Archive-1' benchmark completed. Peak: 480MB/s</span>
            </div>
            <div className="flex items-center gap-4 p-2 hover:bg-white/5 rounded transition-colors group bg-yellow-500/5">
              <span className="text-dark-600">[{format(new Date(), 'HH:mm:ss.SSS')}]</span>
              <span className="text-yellow-500 uppercase font-black">WARN</span>
              <span className="text-dark-300">Temperature sensor 'Node-01:CPU' exceeded 70C during re-index operation</span>
            </div>
            <div className="flex items-center gap-4 p-2 hover:bg-white/5 rounded transition-colors group">
              <span className="text-dark-600">[{format(new Date(), 'HH:mm:ss.SSS')}]</span>
              <span className="text-blue-500 uppercase font-black">SYNC</span>
              <span className="text-dark-300">Synchronized 482 media segments with secondary storage pool</span>
            </div>
            <div className="flex items-center gap-4 p-2 hover:bg-white/5 rounded transition-colors group">
              <span className="text-dark-600">[{format(new Date(), 'HH:mm:ss.SSS')}]</span>
              <span className="text-primary-500 uppercase font-black">AUTH</span>
              <span className="text-dark-300">Session validated for user 'admin' (Source: 192.168.1.45)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for relative time formatting
function format(date: Date, pattern: string) {
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  const secs = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${mins}:${secs}.${ms}`;
}

// ============================================================================
// HEALTH DASHBOARD
// Monitors system health, storage, and connectivity
// ============================================================================

import React from 'react';
import { Activity, Server, Database, HardDrive, Cpu, Wifi } from 'lucide-react';

export const HealthDashboard: React.FC = () => {
  const metrics = [
    { label: 'CPU Usage', value: '45%', icon: Cpu, color: 'text-blue-500' },
    { label: 'Memory', value: '8.2 / 16 GB', icon: Activity, color: 'text-green-500' },
    { label: 'Storage Free', value: '2.4 TB', icon: HardDrive, color: 'text-yellow-500' },
    { label: 'Network In', value: '450 Mbps', icon: Wifi, color: 'text-purple-500' },
  ];

  const storagePools = [
    { name: 'Primary Archive', total: '10 TB', used: '6.5 TB', status: 'healthy' },
    { name: 'SSD Buffer', total: '1 TB', used: '0.2 TB', status: 'healthy' },
    { name: 'Expansion Array', total: '20 TB', used: '18 TB', status: 'warning' },
  ];

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-y-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">System Health</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          System Normal
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-dark-400 text-sm">{m.label}</span>
              <m.icon className={m.color} size={24} />
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Pools */}
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center gap-2 mb-6">
            <Database className="text-primary-500" size={20} />
            <h2 className="text-lg font-semibold text-white">Storage Pools</h2>
          </div>
          <div className="space-y-6">
            {storagePools.map((pool, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">{pool.name}</span>
                  <span className="text-dark-400">{pool.used} / {pool.total}</span>
                </div>
                <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${pool.status === 'warning' ? 'bg-yellow-500' : 'bg-primary-500'}`}
                    style={{ width: `${(parseFloat(pool.used) / parseFloat(pool.total)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Server Status */}
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center gap-2 mb-6">
            <Server className="text-primary-500" size={20} />
            <h2 className="text-lg font-semibold text-white">Recorder Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-500">
                  S1
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Main Recorder</div>
                  <div className="text-xs text-dark-400">v0.1.0 • 192.168.1.10</div>
                </div>
              </div>
              <div className="text-xs text-green-500 font-medium">ONLINE</div>
            </div>
            {/* Add more servers as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SETTINGS PAGE
// Application and system configuration
// ============================================================================

import React from 'react';
import { User, Bell, Palette, Shield, Database, Globe } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const sections = [
    { title: 'Profile', icon: User, desc: 'Manage your account and personal details' },
    { title: 'Notifications', icon: Bell, desc: 'Configure alerts and system updates' },
    { title: 'Appearance', icon: Palette, desc: 'Customize theme and display options' },
    { title: 'Security', icon: Shield, desc: 'Manage password and access control' },
    { title: 'Storage', icon: Database, desc: 'Configure recording paths and retention' },
    { title: 'Network', icon: Globe, desc: 'Server connectivity and stream settings' },
  ];

  return (
    <div className="h-full flex flex-col bg-dark-900 p-8 max-w-5xl mx-auto overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((s, i) => (
          <button 
            key={i}
            className="flex items-start gap-4 p-6 bg-dark-800 rounded-xl border border-dark-700 hover:border-primary-500/50 hover:bg-dark-700/50 text-left transition-all group"
          >
            <div className="p-3 bg-dark-900 rounded-lg text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <s.icon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-sm text-dark-400">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 flex justify-between items-center p-6 bg-dark-800/50 rounded-xl border border-dark-700">
        <div>
          <h4 className="text-white font-medium">About NXvms</h4>
          <p className="text-sm text-dark-400">Version 0.1.0 (Alpha)</p>
        </div>
        <button className="text-primary-500 hover:text-primary-400 text-sm font-medium">
          Check for updates
        </button>
      </div>
    </div>
  );
};

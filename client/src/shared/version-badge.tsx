// src/shared/version-badge.tsx - Version display component

import React from 'react';
import { getVersionBadge } from './version';

export const VersionBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const version = getVersionBadge();

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="px-2 py-0.5 bg-dark-700/50 backdrop-blur-sm border border-white/10 rounded-full text-[10px] font-mono font-medium text-dark-300 tracking-tight">
        {version}
      </span>
    </div>
  );
};

export default VersionBadge;

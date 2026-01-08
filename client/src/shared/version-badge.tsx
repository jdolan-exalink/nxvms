// src/shared/version-badge.tsx - Version display component

import React from 'react';
import { getVersionBadge } from './version';

export const VersionBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const version = getVersionBadge();

  return (
    <div className={`flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 ${className}`}>
      {version}
    </div>
  );
};

export default VersionBadge;

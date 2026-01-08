// src/shared/version.ts - Version management utility

export const getVersion = (): string => {
  // Try to get version from import.meta.env (Vite environment variables)
  const envVersion = import.meta.env.VITE_APP_VERSION;
  if (envVersion) {
    return envVersion;
  }

  // Fallback to package.json version
  return __APP_VERSION__;
};

export const getVersionBadge = (): string => {
  return `v${getVersion()}`;
};

export const getFullVersion = (): string => {
  const version = getVersion();
  const buildDate = new Date().toISOString().split('T')[0];
  return `${version} (${buildDate})`;
};

// Declare global for build-time version injection
declare const __APP_VERSION__: string;

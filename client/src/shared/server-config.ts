/**
 * NXvms Client Configuration
 * 
 * This file helps manage server configuration for development and testing
 */

export interface ServerConfig {
  name: string;
  url: string;
  description: string;
  isDefault: boolean;
}

export const SERVER_CONFIGS: ServerConfig[] = [
  {
    name: 'Real Backend (Local)',
    url: 'http://localhost:3000/api/v1',
    description: 'Connect to the real NestJS backend server running locally',
    isDefault: true,
  },
  {
    name: 'Mock Server',
    url: 'http://localhost:3001/api/v1',
    description: 'Connect to the mock server for development/testing',
    isDefault: false,
  },
  {
    name: 'Production',
    url: 'https://api.nxvms.com/api/v1',
    description: 'Connect to the production server',
    isDefault: false,
  },
];

export const DEFAULT_SERVER = SERVER_CONFIGS.find((s) => s.isDefault) || SERVER_CONFIGS[0];

/**
 * Get the appropriate server URL based on environment
 * Auto-detects if running from a different IP than localhost
 */
export function getDefaultServerUrl(): string {
  // Check if manually configured in localStorage
  const storedServerUrl = localStorage.getItem('nxvms_server_url');
  if (storedServerUrl) {
    return storedServerUrl;
  }

  // Detect current window location and adapt server URL
  if (typeof window !== 'undefined' && window.location) {
    const currentHostname = window.location.hostname;
    const currentPort = window.location.port;
    
    // If accessing from a non-localhost IP, use the same IP for backend
    if (currentHostname !== 'localhost' && currentHostname !== '127.0.0.1' && currentHostname !== '0.0.0.0') {
      // User is accessing from a different IP (e.g., 10.1.1.174)
      // Connect backend to the same IP instead of localhost
      return `http://${currentHostname}:3000/api/v1`;
    }
  }

  return DEFAULT_SERVER.url;
}

/**
 * Set the server URL manually (stores in localStorage)
 */
export function setServerUrl(url: string): void {
  localStorage.setItem('nxvms_server_url', url);
}

/**
 * Clear the manually set server URL
 */
export function clearServerUrl(): void {
  localStorage.removeItem('nxvms_server_url');
}

/**
 * Check if a server is accessible
 */
export async function checkServerHealth(serverUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${serverUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get list of available servers
 */
export function getAvailableServers(): ServerConfig[] {
  return SERVER_CONFIGS;
}

/**
 * Find server by URL
 */
export function findServerByUrl(url: string): ServerConfig | undefined {
  return SERVER_CONFIGS.find((s) => s.url === url);
}

/**
 * Find server by name
 */
export function findServerByName(name: string): ServerConfig | undefined {
  return SERVER_CONFIGS.find((s) => s.name === name);
}

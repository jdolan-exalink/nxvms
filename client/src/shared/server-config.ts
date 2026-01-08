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
    url: '/api/v1',
    description: 'Connect to the real NestJS backend server via Nginx proxy',
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
 * Uses relative URLs (/api/v1) to proxy through Nginx
 * This avoids CORS issues and port conflicts
 */
export function getDefaultServerUrl(): string {
  // 1. Check if manually configured in localStorage
  const storedServerUrl = localStorage.getItem('nxvms_server_url');
  if (storedServerUrl) {
    console.log('[NXvms] Using stored server URL:', storedServerUrl);
    return storedServerUrl;
  }

  // 2. Use relative URL to proxy through Nginx (same protocol, host, and port as client)
  // This avoids CORS issues and works with Nginx reverse proxy
  console.log('[NXvms] Using relative URL: /api/v1 (proxied through Nginx)');
  return '/api/v1';
}

/**
 * Get available servers (predefined + saved custom ones)
 */
export function getAvailableServers(): ServerConfig[] {
  const customServersJson = localStorage.getItem('nxvms_custom_servers');
  const customServers: ServerConfig[] = customServersJson 
    ? JSON.parse(customServersJson) 
    : [];
  
  return [...SERVER_CONFIGS, ...customServers];
}

/**
 * Set the server URL manually (stores in localStorage)
 */
export function setServerUrl(url: string): void {
  localStorage.setItem('nxvms_server_url', url);
  console.log('[NXvms] Server URL set to:', url);
}

/**
 * Add a custom server to the list (saved in localStorage)
 */
export function addCustomServer(name: string, url: string): void {
  const customServersJson = localStorage.getItem('nxvms_custom_servers') || '[]';
  const customServers: ServerConfig[] = JSON.parse(customServersJson);
  
  // Check if already exists
  if (!customServers.find(s => s.url === url)) {
    customServers.push({
      name,
      url,
      description: `Custom server: ${url}`,
      isDefault: false,
    });
    localStorage.setItem('nxvms_custom_servers', JSON.stringify(customServers));
    console.log('[NXvms] Custom server added:', name, url);
  }
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
 * Find server by URL
 */
export function findServerByUrl(url: string): ServerConfig | undefined {
  return getAvailableServers().find((s) => s.url === url);
}

/**
 * Find server by name
 */
export function findServerByName(name: string): ServerConfig | undefined {
  return getAvailableServers().find((s) => s.name === name);
}

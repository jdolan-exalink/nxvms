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
 */
export function getDefaultServerUrl(): string {
  const env = process.env.VITE_API_URL || DEFAULT_SERVER.url;
  return env;
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

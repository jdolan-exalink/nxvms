// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { FILE_SIZE_UNITS, DATE_FORMATS } from './constants';

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Format a date string to a display format
 */
export function formatDate(date: string | Date, formatStr: string = DATE_FORMATS.DISPLAY): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ============================================================================
// FILE SIZE UTILITIES
// ============================================================================

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${FILE_SIZE_UNITS[i]}`;
}

/**
 * Parse human-readable size to bytes
 */
export function parseFileSize(size: string): number {
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB|PB)$/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const index = FILE_SIZE_UNITS.indexOf(unit);
  return value * Math.pow(1024, index);
}

// ============================================================================
// BITRATE UTILITIES
// ============================================================================

/**
 * Format bitrate to human-readable format
 */
export function formatBitrate(bps: number): string {
  const kbps = bps / 1000;
  const mbps = kbps / 1000;
  if (mbps >= 1) {
    return `${mbps.toFixed(2)} Mbps`;
  }
  return `${kbps.toFixed(2)} Kbps`;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Chunk an array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by a key
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specific keys from an object
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate IP address
 */
export function isValidIp(ip: string): boolean {
  const re =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return re.test(ip);
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Get item from local storage
 */
export function getStorageItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue ?? null;
  } catch {
    return defaultValue ?? null;
  }
}

/**
 * Set item in local storage
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to set storage item:', error);
  }
}

/**
 * Remove item from local storage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove storage item:', error);
  }
}

/**
 * Clear all storage items
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get contrasting text color (black or white) based on background color
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ============================================================================
// DOWNLOAD UTILITIES
// ============================================================================

/**
 * Download a file from a URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

/**
 * Download data as a file
 */
export function downloadData(data: string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
}

// ============================================================================
// CLIPBOARD UTILITIES
// ============================================================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

// ============================================================================
// RESOLUTION UTILITIES
// ============================================================================

/**
 * Parse resolution string (e.g., "1920x1080")
 */
export function parseResolution(resolution: string): { width: number; height: number } | null {
  const match = resolution.match(/^(\d+)x(\d+)$/);
  if (!match) return null;
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
  };
}

/**
 * Format resolution object to string
 */
export function formatResolution(width: number, height: number): string {
  return `${width}x${height}`;
}

/**
 * Calculate aspect ratio
 */
export function getAspectRatio(width: number, height: number): number {
  return width / height;
}

// ============================================================================
// FPS UTILITIES
// ============================================================================

/**
 * Format FPS value
 */
export function formatFps(fps: number): string {
  return `${fps.toFixed(1)} FPS`;
}

/**
 * Calculate FPS from frame timestamps
 */
export function calculateFps(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
  return duration > 0 ? (timestamps.length - 1) / duration : 0;
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Get error message from error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'NetworkError' ||
      error.message.includes('network') ||
      error.message.includes('fetch')
    );
  }
  return false;
}

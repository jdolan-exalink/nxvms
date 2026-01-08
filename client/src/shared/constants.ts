// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================

export const APP_NAME = 'NXvms Client';
export const APP_VERSION = '0.1.0';
export const APP_ID = 'com.nxvms.client';

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000; // 30 seconds
export const WS_RECONNECT_DELAY = 3000; // 3 seconds
export const WS_MAX_RECONNECT_ATTEMPTS = 10;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nxvms_access_token',
  REFRESH_TOKEN: 'nxvms_refresh_token',
  SERVER_URL: 'nxvms_server_url',
  SERVERS: 'nxvms_servers',
  USER: 'nxvms_user',
  THEME: 'nxvms_theme',
  LANGUAGE: 'nxvms_language',
  LAYOUTS: 'nxvms_layouts',
  RECENT_CAMERAS: 'nxvms_recent_cameras',
} as const;

// ============================================================================
// LAYOUT SIZES
// ============================================================================

export const LAYOUT_SIZES = [1, 4, 9, 16] as const;
export type LayoutSize = (typeof LAYOUT_SIZES)[number];

export const LAYOUT_GRID = {
  1: { cols: 1, rows: 1 },
  4: { cols: 2, rows: 2 },
  9: { cols: 3, rows: 3 },
  16: { cols: 4, rows: 4 },
} as const;

// ============================================================================
// PLAYBACK SPEEDS
// ============================================================================

export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

// ============================================================================
// EVENT TYPES
// ============================================================================

export const EVENT_TYPES = {
  MOTION: 'motion',
  LINE_CROSS: 'line_cross',
  ANALYTICS: 'analytics',
  SYSTEM: 'system',
} as const;

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
} as const;

// ============================================================================
// CAMERA STATUS COLORS
// ============================================================================

export const STATUS_COLORS = {
  online: '#22c55e',
  offline: '#ef4444',
  recording: '#3b82f6',
  error: '#ef4444',
  disconnected: '#6b7280',
  warning: '#f59e0b',
} as const;

// ============================================================================
// STREAM TRANSPORT PREFERENCES
// ============================================================================

export const TRANSPORT_PREFERENCE = {
  AUTO: 'auto',
  WEBRTC: 'webrtc',
  HLS: 'hls',
  DASH: 'dash',
  RTSP: 'rtsp',
} as const;

// ============================================================================
// EXPORT FORMATS
// ============================================================================

export const EXPORT_FORMATS = {
  MP4: 'mp4',
  AVI: 'avi',
  MKV: 'mkv',
} as const;

// ============================================================================
// WATERMARK POSITIONS
// ============================================================================

export const WATERMARK_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
} as const;

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMATS = {
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm:ss',
  DISPLAY: 'MMM d, yyyy HH:mm',
  DISPLAY_SHORT: 'MMM d, HH:mm',
} as const;

// ============================================================================
// FILE SIZE FORMATS
// ============================================================================

export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  FULLSCREEN: 'F11',
  ESCAPE: 'Escape',
  PLAY_PAUSE: 'Space',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  SPEED_UP: '>',
  SPEED_DOWN: '<',
  MUTE: 'M',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  NEXT_CAMERA: 'Tab',
  PREVIOUS_CAMERA: 'Shift+Tab',
  SNAPSHOT: 'S',
  PTZ_UP: 'W',
  PTZ_DOWN: 'S',
  PTZ_LEFT: 'A',
  PTZ_RIGHT: 'D',
  PTZ_ZOOM_IN: 'Q',
  PTZ_ZOOM_OUT: 'E',
} as const;

// ============================================================================
// RETENTION POLICIES
// ============================================================================

export const RETENTION_POLICIES = {
  DAYS_7: 7,
  DAYS_30: 30,
  DAYS_90: 90,
  DAYS_180: 180,
  DAYS_365: 365,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  AUTH_001: 'AUTH_001', // Invalid credentials
  AUTH_002: 'AUTH_002', // Token expired
  AUTH_003: 'AUTH_003', // Invalid token
  AUTH_004: 'AUTH_004', // Insufficient permissions
  RES_001: 'RES_001', // Resource not found
  RES_002: 'RES_002', // Resource already exists
  RES_003: 'RES_003', // Resource locked
  STR_001: 'STR_001', // Stream not available
  STR_002: 'STR_002', // Stream offline
  SRV_001: 'SRV_001', // Server error
  SRV_002: 'SRV_002', // Service unavailable
} as const;

// ============================================================================
// RATE LIMITS
// ============================================================================

export const RATE_LIMITS = {
  AUTH: { limit: 10, window: 60000 }, // 10 requests per minute
  STREAMING: { limit: 100, window: 60000 }, // 100 requests per minute
  API: { limit: 1000, window: 60000 }, // 1000 requests per minute
  WS: { limit: 1000, window: 60000 }, // 1000 messages per minute
} as const;

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_SERVER_URL = 'http://localhost:3000/api/v1';
export const MOCK_WS_URL = 'ws://localhost:3000/ws';

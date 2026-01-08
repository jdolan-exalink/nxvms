// ============================================================================
// SHARED TYPE DEFINITIONS
// These types are shared between client and server
// ============================================================================

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: Role;
  permissions: Permission[];
  createdAt: string;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface ServerInfo {
  id: string;
  name: string;
  url: string;
  version: string;
  capabilities: string[];
}

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export enum ServerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  DEGRADED = 'degraded',
  MAINTENANCE = 'maintenance',
}

export enum CameraStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  RECORDING = 'recording',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}

export enum StreamType {
  RTSP = 'rtsp',
  WEBRTC = 'webrtc',
  HLS = 'hls',
  DASH = 'dash',
}

export interface Site {
  id: string;
  name: string;
  description?: string;
  servers: Server[];
  groups: Group[];
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  status: ServerStatus;
  capabilities: string[];
  cameras: Camera[];
}

export interface Group {
  id: string;
  name: string;
  type: 'camera' | 'server' | 'site';
  parentId?: string;
  resourceIds: string[];
}

export interface Camera {
  id: string;
  name: string;
  description?: string;
  serverId: string;
  status: CameraStatus;
  capabilities: CameraCapabilities;
  streams: Stream[];
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CameraCapabilities {
  ptz: boolean;
  ptzPresets: boolean;
  digitalZoom: boolean;
  audio: boolean;
  motionDetection: boolean;
  analytics: boolean;
  onvif: boolean;
  supportedProfiles: StreamProfile[];
}

export interface StreamProfile {
  name: string;
  type: 'main' | 'sub';
  resolution: string;
  fps: number;
  bitrate: number;
  codec: string;
  audioCodec?: string;
}

export interface Stream {
  id: string;
  profileId: string;
  url: string;
  type: StreamType;
  isActive: boolean;
}

export interface CameraHealth {
  status: 'healthy' | 'warning' | 'critical';
  fps: number;
  bitrate: number;
  lastFrameTime: string;
  uptime: number;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// STREAMING TYPES
// ============================================================================

export interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export interface StreamInfo {
  streamId: string;
  url: string;
  sdp?: string;
  iceServers?: IceServer[];
  expiresAt: string;
}

export interface PtzPosition {
  pan: number;
  tilt: number;
  zoom: number;
}

export interface PtzPreset {
  id: string;
  name: string;
  position: PtzPosition;
}

// ============================================================================
// PLAYBACK TYPES
// ============================================================================

export interface TimelineSegment {
  startTime: string;
  endTime: string;
  profileId: string;
  hasMotion: boolean;
  sizeBytes: number;
}

export interface TimelineEvent {
  id: string;
  type: 'motion' | 'analytics' | 'manual';
  startTime: string;
  endTime: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface PlaybackSession {
  sessionId: string;
  url: string;
  sdp?: string;
  iceServers?: IceServer[];
  availableStartTime: string;
  availableEndTime: string;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  id: string;
  type: string;
  cameraId: string;
  serverId: string;
  startTime: string;
  endTime?: string;
  confidence?: number;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// ============================================================================
// BOOKMARK TYPES
// ============================================================================

export interface Bookmark {
  id: string;
  cameraId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  thumbnailUrl?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportJob {
  id: string;
  cameraId: string;
  startTime: string;
  endTime: string;
  format: string;
  sizeBytes?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  hash?: {
    algorithm: string;
    value: string;
  };
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

// ============================================================================
// HEALTH TYPES
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  components: HealthComponent[];
}

export interface HealthComponent {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  message?: string;
  metrics?: Record<string, number>;
}

export interface StoragePool {
  id: string;
  name: string;
  path: string;
  totalCapacity: number;
  usedCapacity: number;
  freeCapacity: number;
  status: 'healthy' | 'warning' | 'critical';
  cameras: string[];
}

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usagePercent: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  storage: {
    readBytesPerSec: number;
    writeBytesPerSec: number;
    iops: number;
  };
  streaming: {
    activeStreams: number;
    totalBandwidth: number;
  };
  recording: {
    activeRecordings: number;
    bytesPerSec: number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'normal' | 'high';
  timestamp: string;
  read: boolean;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export type LayoutSize = 1 | 4 | 9 | 16 | 'custom';

export interface Layout {
  id: string;
  name: string;
  size: LayoutSize;
  cameras: LayoutCamera[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutCamera {
  cameraId: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  streamProfileId?: string;
}

// ============================================================================
// SERVER DIRECTORY TYPES
// ============================================================================

export interface DirectoryServer {
  id: string;
  name: string;
  url: string;
  status: ServerStatus;
  lastSeen: string;
  version?: string;
  location?: string;
}

// ============================================================================
// WEBSOCKET MESSAGE TYPES
// ============================================================================

export interface WSMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

export type WSCameraStatusEvent = WSMessage<{
  cameraId: string;
  status: CameraStatus;
  timestamp: string;
}>;

export type WSEventEvent = WSMessage<{
  event: Event;
}>;

export type WSHealthEvent = WSMessage<{
  component: string;
  status: 'healthy' | 'degraded' | 'critical';
  message?: string;
}>;

export type WSNotificationEvent = WSMessage<Notification>;

export type WSRecordingEvent = WSMessage<{
  cameraId: string;
  recording: boolean;
  startTime?: string;
}>;

export type WSExportEvent = WSMessage<{
  exportId: string;
  progress: number;
  status: 'processing' | 'completed' | 'failed';
}>;

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface AppState {
  isAuthenticated: boolean;
  currentUser?: User;
  currentServer?: ServerInfo;
  servers: DirectoryServer[];
  theme: 'light' | 'dark';
  language: string;
}

export interface ViewMode {
  type: 'live' | 'playback' | 'events' | 'health' | 'settings';
  selectedCameraId?: string;
  selectedLayoutId?: string;
}

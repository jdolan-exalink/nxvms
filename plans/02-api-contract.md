# API Contract - Client ↔ Server

## Base Configuration

### API Endpoints
- **Base URL**: Configurable per server (e.g., `https://vms-server.example.com/api/v1`)
- **WebSocket URL**: `wss://vms-server.example.com/ws`
- **Protocol**: HTTPS/WSS (TLS 1.3 required)

### Authentication
- **Method**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <access_token>`
- **Refresh Token**: Stored in secure HTTP-only cookies or localStorage with encryption

### Common Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Invalid token |
| `AUTH_004` | Insufficient permissions |
| `RES_001` | Resource not found |
| `RES_002` | Resource already exists |
| `RES_003` | Resource locked |
| `STR_001` | Stream not available |
| `STR_002` | Stream offline |
| `SRV_001` | Server error |
| `SRV_002` | Service unavailable |

---

## 1. Authentication Module

### 1.1 Login
```typescript
// POST /auth/login
interface LoginRequest {
  username: string;
  password: string;
  serverUrl?: string;  // Optional if pre-selected
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  // seconds
  server: ServerInfo;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: Role;
  permissions: Permission[];
  createdAt: string;
  lastLogin?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

interface Permission {
  resource: string;  // e.g., "camera:*", "camera:view", "layout:*"
  actions: string[]; // e.g., ["view", "export", "admin"]
}

interface ServerInfo {
  id: string;
  name: string;
  url: string;
  version: string;
  capabilities: string[];
}
```

### 1.2 Refresh Token
```typescript
// POST /auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### 1.3 Logout
```typescript
// POST /auth/logout
interface LogoutResponse {
  success: boolean;
}
```

### 1.4 Get Current User
```typescript
// GET /auth/me
interface MeResponse {
  user: User;
  server: ServerInfo;
}
```

---

## 2. Resources Module

### 2.1 Get Resource Tree
```typescript
// GET /resources/tree
interface ResourceTreeResponse {
  sites: Site[];
}

interface Site {
  id: string;
  name: string;
  description?: string;
  servers: Server[];
  groups: Group[];
}

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  status: ServerStatus;
  capabilities: string[];
  cameras: Camera[];
}

interface Group {
  id: string;
  name: string;
  type: 'camera' | 'server' | 'site';
  parentId?: string;
  resourceIds: string[];
}

interface Camera {
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

enum ServerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  DEGRADED = 'degraded',
  MAINTENANCE = 'maintenance'
}

enum CameraStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  RECORDING = 'recording',
  ERROR = 'error',
  DISCONNECTED = 'disconnected'
}

interface CameraCapabilities {
  ptz: boolean;
  ptzPresets: boolean;
  digitalZoom: boolean;
  audio: boolean;
  motionDetection: boolean;
  analytics: boolean;
  onvif: boolean;
  supportedProfiles: StreamProfile[];
}

interface StreamProfile {
  name: string;
  type: 'main' | 'sub';
  resolution: string;  // e.g., "1920x1080"
  fps: number;
  bitrate: number;  // kbps
  codec: string;  // e.g., "H264", "H265"
  audioCodec?: string;
}

interface Stream {
  id: string;
  profileId: string;
  url: string;  // RTSP URL or internal ID
  type: StreamType;
  isActive: boolean;
}

enum StreamType {
  RTSP = 'rtsp',
  WEBRTC = 'webrtc',
  HLS = 'hls',
  DASH = 'dash'
}
```

### 2.2 Get Camera Details
```typescript
// GET /resources/cameras/{cameraId}
interface CameraDetailsResponse {
  camera: Camera;
  recordingSchedule?: RecordingSchedule;
  retentionPolicy?: RetentionPolicy;
  health: CameraHealth;
}

interface RecordingSchedule {
  id: string;
  type: 'continuous' | 'event' | 'hybrid';
  schedules: ScheduleEntry[];
}

interface ScheduleEntry {
  days: number[];  // 0-6 (Sunday-Saturday)
  startTime: string;  // HH:MM
  endTime: string;  // HH:MM
  profileId: string;
}

interface RetentionPolicy {
  days: number;
  maxSizeGB?: number;
  priority: 'low' | 'normal' | 'high';
}

interface CameraHealth {
  status: 'healthy' | 'warning' | 'critical';
  fps: number;
  bitrate: number;  // kbps
  lastFrameTime: string;
  uptime: number;  // seconds
  errors: string[];
  warnings: string[];
}
```

### 2.3 Create Camera (Manual)
```typescript
// POST /resources/cameras
interface CreateCameraRequest {
  name: string;
  description?: string;
  serverId: string;
  rtspUrl: string;
  username?: string;
  password?: string;
  groupId?: string;
  tags?: string[];
}

interface CreateCameraResponse {
  camera: Camera;
}
```

### 2.4 Update Camera
```typescript
// PUT /resources/cameras/{cameraId}
interface UpdateCameraRequest {
  name?: string;
  description?: string;
  groupId?: string;
  tags?: string[];
  recordingSchedule?: RecordingSchedule;
  retentionPolicy?: RetentionPolicy;
}

interface UpdateCameraResponse {
  camera: Camera;
}
```

### 2.5 Delete Camera
```typescript
// DELETE /resources/cameras/{cameraId}
interface DeleteCameraResponse {
  success: boolean;
}
```

### 2.6 Discover ONVIF Cameras
```typescript
// POST /resources/discover/onvif
interface OnvifDiscoveryRequest {
  serverId: string;
  timeout?: number;  // seconds, default 5
}

interface OnvifDiscoveryResponse {
  cameras: DiscoveredCamera[];
}

interface DiscoveredCamera {
  ip: string;
  port: number;
  manufacturer?: string;
  model?: string;
  name?: string;
  rtspUrl?: string;
  onvifUrl?: string;
  credentialsRequired: boolean;
}
```

---

## 3. Streaming Module

### 3.1 Start Live Stream
```typescript
// POST /streaming/live
interface StartLiveStreamRequest {
  cameraId: string;
  profileId: string;
  transport: 'webrtc' | 'hls' | 'dash' | 'rtsp';
}

interface StartLiveStreamResponse {
  streamId: string;
  url: string;
  sdp?: string;  // For WebRTC
  iceServers?: IceServer[];
  expiresAt: string;
}

interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}
```

### 3.2 Stop Live Stream
```typescript
// DELETE /streaming/live/{streamId}
interface StopLiveStreamResponse {
  success: boolean;
}
```

### 3.3 Get Stream Status
```typescript
// GET /streaming/status/{streamId}
interface StreamStatusResponse {
  streamId: string;
  status: 'starting' | 'active' | 'inactive' | 'error';
  cameraId: string;
  startTime: string;
  bytesReceived: number;
  framesReceived: number;
  bitrate: number;  // kbps
  fps: number;
}
```

### 3.4 PTZ Control
```typescript
// POST /streaming/ptz/{cameraId}
interface PtzRequest {
  action: PtzAction;
  params?: PtzParams;
}

type PtzAction =
  | 'move'
  | 'stop'
  | 'preset'
  | 'zoom'
  | 'focus'
  | 'home';

interface PtzParams {
  x?: number;  // -1 to 1 (pan)
  y?: number;  // -1 to 1 (tilt)
  speed?: number;  // 0 to 1
  presetId?: string;
  zoom?: number;  // 0 to 1
  focus?: 'auto' | 'manual';
  focusDistance?: number;
}

interface PtzResponse {
  success: boolean;
  position?: PtzPosition;
}

interface PtzPosition {
  pan: number;
  tilt: number;
  zoom: number;
}

// GET /streaming/ptz/{cameraId}/presets
interface PtzPresetsResponse {
  presets: PtzPreset[];
}

interface PtzPreset {
  id: string;
  name: string;
  position: PtzPosition;
}
```

### 3.5 Snapshot
```typescript
// POST /streaming/snapshot/{cameraId}
interface SnapshotRequest {
  profileId?: string;
  format?: 'jpg' | 'png';
  quality?: number;  // 1-100
}

interface SnapshotResponse {
  imageId: string;
  url: string;
  timestamp: string;
  width: number;
  height: number;
}
```

---

## 4. Playback Module

### 4.1 Get Timeline
```typescript
// GET /playback/timeline/{cameraId}
interface TimelineRequest {
  startTime: string;  // ISO 8601
  endTime: string;   // ISO 8601
  resolution?: number;  // milliseconds per pixel
}

interface TimelineResponse {
  cameraId: string;
  startTime: string;
  endTime: string;
  segments: TimelineSegment[];
  events?: TimelineEvent[];
}

interface TimelineSegment {
  startTime: string;
  endTime: string;
  profileId: string;
  hasMotion: boolean;
  sizeBytes: number;
}

interface TimelineEvent {
  id: string;
  type: 'motion' | 'analytics' | 'manual';
  startTime: string;
  endTime: string;
  confidence?: number;
  metadata?: any;
}
```

### 4.2 Start Playback
```typescript
// POST /playback/start
interface PlaybackStartRequest {
  cameraId: string;
  startTime: string;  // ISO 8601
  endTime?: string;   // ISO 8601, optional for continuous
  transport: 'webrtc' | 'hls' | 'dash';
  speed?: number;  // 0.25, 0.5, 1, 2, 4, 8, 16
}

interface PlaybackStartResponse {
  sessionId: string;
  url: string;
  sdp?: string;  // For WebRTC
  iceServers?: IceServer[];
  availableStartTime: string;
  availableEndTime: string;
}
```

### 4.3 Seek Playback
```typescript
// POST /playback/seek/{sessionId}
interface PlaybackSeekRequest {
  timestamp: string;  // ISO 8601
}

interface PlaybackSeekResponse {
  success: true;
  actualTimestamp: string;
}
```

### 4.4 Control Playback
```typescript
// POST /playback/control/{sessionId}
interface PlaybackControlRequest {
  action: 'play' | 'pause' | 'stop';
  speed?: number;
}

interface PlaybackControlResponse {
  success: boolean;
  state: 'playing' | 'paused' | 'stopped';
  speed: number;
}
```

### 4.5 Frame Step
```typescript
// POST /playback/frame/{sessionId}
interface FrameStepRequest {
  direction: 'forward' | 'backward';
}

interface FrameStepResponse {
  success: boolean;
  timestamp: string;
  frameNumber: number;
}
```

### 4.6 Stop Playback
```typescript
// DELETE /playback/session/{sessionId}
interface PlaybackStopResponse {
  success: boolean;
}
```

---

## 5. Events Module

### 5.1 Get Events
```typescript
// GET /events
interface EventsRequest {
  cameraId?: string;
  type?: string[];
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
}

interface EventsResponse {
  events: Event[];
  total: number;
  limit: number;
  offset: number;
}

interface Event {
  id: string;
  type: string;  // 'motion', 'line_cross', 'analytics', 'system'
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
```

### 5.2 Acknowledge Event
```typescript
// POST /events/{eventId}/acknowledge
interface AcknowledgeEventResponse {
  success: boolean;
  acknowledgedAt: string;
}
```

### 5.3 Get Event Details
```typescript
// GET /events/{eventId}
interface EventDetailsResponse {
  event: Event;
  relatedEvents?: Event[];
  snapshots?: string[];  // Image URLs
}
```

---

## 6. Bookmarks Module

### 6.1 Get Bookmarks
```typescript
// GET /bookmarks
interface BookmarksRequest {
  cameraId?: string;
  startTime?: string;
  endTime?: string;
  tags?: string[];
}

interface BookmarksResponse {
  bookmarks: Bookmark[];
}

interface Bookmark {
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
```

### 6.2 Create Bookmark
```typescript
// POST /bookmarks
interface CreateBookmarkRequest {
  cameraId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  tags?: string[];
}

interface CreateBookmarkResponse {
  bookmark: Bookmark;
}
```

### 6.3 Update Bookmark
```typescript
// PUT /bookmarks/{bookmarkId}
interface UpdateBookmarkRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

interface UpdateBookmarkResponse {
  bookmark: Bookmark;
}
```

### 6.4 Delete Bookmark
```typescript
// DELETE /bookmarks/{bookmarkId}
interface DeleteBookmarkResponse {
  success: boolean;
}
```

---

## 7. Export Module

### 7.1 Create Export Job
```typescript
// POST /export
interface CreateExportRequest {
  cameraId: string;
  startTime: string;
  endTime: string;
  includeAudio?: boolean;
  format?: 'mp4' | 'avi' | 'mkv';
  watermark?: {
    enabled: boolean;
    text?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  includeMetadata?: boolean;
}

interface CreateExportResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedSizeBytes?: number;
}
```

### 7.2 Get Export Status
```typescript
// GET /export/{exportId}
interface ExportStatusResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;  // 0-100
  sizeBytes?: number;
  downloadUrl?: string;
  hash?: {
    algorithm: string;
    value: string;
  };
  error?: string;
}
```

### 7.3 List Exports
```typescript
// GET /export
interface ListExportsRequest {
  cameraId?: string;
  status?: string[];
  limit?: number;
  offset?: number;
}

interface ListExportsResponse {
  exports: Export[];
  total: number;
}

interface Export {
  id: string;
  cameraId: string;
  startTime: string;
  endTime: string;
  format: string;
  sizeBytes?: number;
  status: string;
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
```

### 7.4 Delete Export
```typescript
// DELETE /export/{exportId}
interface DeleteExportResponse {
  success: boolean;
}
```

---

## 8. Health Module

### 8.1 Get System Health
```typescript
// GET /health
interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  components: HealthComponent[];
}

interface HealthComponent {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  message?: string;
  metrics?: Record<string, number>;
}
```

### 8.2 Get Camera Health
```typescript
// GET /health/cameras
interface CamerasHealthResponse {
  cameras: CameraHealthEntry[];
  summary: {
    total: number;
    online: number;
    offline: number;
    recording: number;
    error: number;
  };
}

interface CameraHealthEntry {
  cameraId: string;
  cameraName: string;
  status: CameraStatus;
  fps: number;
  bitrate: number;
  lastFrameTime: string;
  uptime: number;
  recording: boolean;
  storageUsed: number;  // bytes
  errors: string[];
}
```

### 8.3 Get Storage Health
```typescript
// GET /health/storage
interface StorageHealthResponse {
  pools: StoragePool[];
  summary: {
    totalCapacity: number;
    usedCapacity: number;
    freeCapacity: number;
    usagePercent: number;
  };
}

interface StoragePool {
  id: string;
  name: string;
  path: string;
  totalCapacity: number;
  usedCapacity: number;
  freeCapacity: number;
  status: 'healthy' | 'warning' | 'critical';
  cameras: string[];
}
```

### 8.4 Get Server Metrics
```typescript
// GET /health/metrics
interface MetricsResponse {
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
```

---

## 9. Users & Permissions Module

### 9.1 Get Users
```typescript
// GET /users
interface GetUsersRequest {
  limit?: number;
  offset?: number;
  search?: string;
}

interface GetUsersResponse {
  users: User[];
  total: number;
}
```

### 9.2 Create User
```typescript
// POST /users
interface CreateUserRequest {
  username: string;
  password: string;
  displayName: string;
  email?: string;
  roleId: string;
}

interface CreateUserResponse {
  user: User;
}
```

### 9.3 Update User
```typescript
// PUT /users/{userId}
interface UpdateUserRequest {
  displayName?: string;
  email?: string;
  roleId?: string;
  password?: string;
}

interface UpdateUserResponse {
  user: User;
}
```

### 9.4 Delete User
```typescript
// DELETE /users/{userId}
interface DeleteUserResponse {
  success: boolean;
}
```

### 9.5 Get Roles
```typescript
// GET /roles
interface GetRolesResponse {
  roles: Role[];
}
```

### 9.6 Create Role
```typescript
// POST /roles
interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

interface CreateRoleResponse {
  role: Role;
}
```

### 9.7 Update Role
```typescript
// PUT /roles/{roleId}
interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

interface UpdateRoleResponse {
  role: Role;
}
```

### 9.8 Delete Role
```typescript
// DELETE /roles/{roleId}
interface DeleteRoleResponse {
  success: boolean;
}
```

---

## 10. WebSocket Events

### Connection
```typescript
// Connect: wss://server/ws?token=<access_token>
interface WSMessage {
  type: string;
  data: any;
  timestamp: string;
}
```

### Event Types

#### Camera Status Change
```typescript
interface WSCameraStatusEvent {
  type: 'camera.status';
  data: {
    cameraId: string;
    status: CameraStatus;
    timestamp: string;
  };
}
```

#### New Event
```typescript
interface WSEventEvent {
  type: 'event.new';
  data: {
    event: Event;
  };
}
```

#### Health Update
```typescript
interface WSHealthEvent {
  type: 'health.update';
  data: {
    component: string;
    status: 'healthy' | 'degraded' | 'critical';
    message?: string;
  };
}
```

#### Notification
```typescript
interface WSNotificationEvent {
  type: 'notification';
  data: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    priority: 'low' | 'normal' | 'high';
    timestamp: string;
    read: boolean;
  };
}
```

#### Recording Status
```typescript
interface WSRecordingEvent {
  type: 'recording.status';
  data: {
    cameraId: string;
    recording: boolean;
    startTime?: string;
  };
}
```

#### Export Progress
```typescript
interface WSExportEvent {
  type: 'export.progress';
  data: {
    exportId: string;
    progress: number;
    status: 'processing' | 'completed' | 'failed';
  };
}
```

---

## 11. Server Directory (Multi-Site)

### 11.1 Get Server Directory
```typescript
// GET /directory/servers
interface ServerDirectoryResponse {
  servers: DirectoryServer[];
}

interface DirectoryServer {
  id: string;
  name: string;
  url: string;
  status: ServerStatus;
  lastSeen: string;
  version?: string;
  location?: string;
}
```

### 11.2 Add Server to Directory
```typescript
// POST /directory/servers
interface AddServerRequest {
  name: string;
  url: string;
  location?: string;
}

interface AddServerResponse {
  server: DirectoryServer;
}
```

### 11.3 Remove Server from Directory
```typescript
// DELETE /directory/servers/{serverId}
interface RemoveServerResponse {
  success: boolean;
}
```

---

## 12. Public API (SDK)

### 12.1 API Keys
```typescript
// POST /api/keys
interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expiresIn?: number;  // seconds
}

interface CreateApiKeyResponse {
  keyId: string;
  apiKey: string;  // Only shown once
  expiresAt: string;
}

// GET /api/keys
interface ListApiKeysResponse {
  keys: ApiKey[];
}

interface ApiKey {
  keyId: string;
  name: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
}

// DELETE /api/keys/{keyId}
interface DeleteApiKeyResponse {
  success: boolean;
}
```

### 12.2 Webhooks
```typescript
// POST /webhooks
interface CreateWebhookRequest {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}

interface CreateWebhookResponse {
  webhook: Webhook;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

// GET /webhooks
interface ListWebhooksResponse {
  webhooks: Webhook[];
}

// DELETE /webhooks/{webhookId}
interface DeleteWebhookResponse {
  success: boolean;
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth endpoints | 10 requests | 1 minute |
| Streaming endpoints | 100 requests | 1 minute |
| API endpoints | 1000 requests | 1 minute |
| WebSocket messages | 1000 messages | 1 minute |

---

## Pagination

All list endpoints support pagination:
- `limit`: Number of items per page (default: 50, max: 1000)
- `offset`: Number of items to skip (default: 0)

Response includes:
- `total`: Total number of items
- `limit`: Current page size
- `offset`: Current offset

---

## Versioning

API version is included in the URL path: `/api/v1/...`

Current version: `v1`

Breaking changes will increment the major version. Non-breaking changes may add new fields without changing the version.

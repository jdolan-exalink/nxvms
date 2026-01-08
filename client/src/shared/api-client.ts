// ============================================================================
// API CLIENT
// Base API client for communicating with the VMS server
// ============================================================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT, STORAGE_KEYS, MOCK_SERVER_URL } from './constants';
import { getDefaultServerUrl } from './server-config';
import {
  ApiResponse,
  User,
  ServerInfo,
  Camera,
  Site,
  StreamInfo,
  TimelineSegment,
  TimelineEvent,
  PlaybackSession,
  Event,
  Bookmark,
  ExportJob,
  SystemHealth,
  StoragePool,
  SystemMetrics,
  DirectoryServer,
  PaginatedResponse,
} from './types';

// ============================================================================
// REQUEST/RESPONSE INTERFACES
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
  serverUrl?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  server: ServerInfo;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface StartLiveStreamRequest {
  cameraId: string;
  profileId: string;
  transport: 'webrtc' | 'hls' | 'dash' | 'rtsp';
}

export interface PlaybackStartRequest {
  cameraId: string;
  startTime: string;
  endTime?: string;
  transport: 'webrtc' | 'hls' | 'dash';
  speed?: number;
}

export interface CreateBookmarkRequest {
  cameraId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  tags?: string[];
}

export interface CreateExportRequest {
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

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL?: string) {
    // Use provided URL, auto-detected URL, or fallback to MOCK_SERVER_URL
    this.baseURL = baseURL || getDefaultServerUrl() || MOCK_SERVER_URL;
    this.client = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadTokens();
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  private loadTokens(): void {
    this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshTokenValue = null;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        if (!this.refreshTokenValue) {
          throw new Error('No refresh token available');
        }

        const response = await this.client.post<ApiResponse<RefreshTokenResponse>>(
          '/auth/refresh',
          { refreshToken: this.refreshTokenValue }
        );

        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken } = response.data.data;
          this.saveTokens(accessToken, refreshToken);
        } else {
          throw new Error('Failed to refresh token');
        }
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ============================================================================
  // INTERCEPTORS
  // ============================================================================

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse<any>>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - token expired
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.refreshTokenValue
        ) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            if (this.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      this.saveTokens(accessToken, refreshToken);
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Login failed');
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<{ user: User; server: ServerInfo }> {
    const response = await this.client.get<ApiResponse<{ user: User; server: ServerInfo }>>(
      '/auth/me'
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get user info');
  }

  // ============================================================================
  // RESOURCES
  // ============================================================================

  async getResourceTree(): Promise<Site[]> {
    const response = await this.client.get<ApiResponse<{ sites: Site[] }>>(
      '/resources/tree'
    );

    if (response.data.success && response.data.data) {
      return response.data.data.sites;
    }

    throw new Error(response.data.error?.message || 'Failed to get resource tree');
  }

  async getCamera(cameraId: string): Promise<Camera> {
    const response = await this.client.get<ApiResponse<{ camera: Camera }>>(
      `/resources/cameras/${cameraId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data.camera;
    }

    throw new Error(response.data.error?.message || 'Failed to get camera');
  }

  async createCamera(data: any): Promise<Camera> {
    const response = await this.client.post<ApiResponse<{ camera: Camera }>>(
      '/resources/cameras',
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.camera;
    }

    throw new Error(response.data.error?.message || 'Failed to create camera');
  }

  async updateCamera(cameraId: string, data: any): Promise<Camera> {
    const response = await this.client.put<ApiResponse<{ camera: Camera }>>(
      `/resources/cameras/${cameraId}`,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.camera;
    }

    throw new Error(response.data.error?.message || 'Failed to update camera');
  }

  async deleteCamera(cameraId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/resources/cameras/${cameraId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete camera');
    }
  }

  async discoverOnvifCameras(serverId: string): Promise<any[]> {
    const response = await this.client.post<ApiResponse<{ cameras: any[] }>>(
      '/resources/discover/onvif',
      { serverId }
    );

    if (response.data.success && response.data.data) {
      return response.data.data.cameras;
    }

    throw new Error(response.data.error?.message || 'Failed to discover cameras');
  }

  // ============================================================================
  // STREAMING
  // ============================================================================

  async startLiveStream(request: StartLiveStreamRequest): Promise<StreamInfo> {
    const response = await this.client.post<ApiResponse<StreamInfo>>(
      '/streaming/live',
      request
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to start stream');
  }

  async stopLiveStream(streamId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/streaming/live/${streamId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to stop stream');
    }
  }

  async getStreamStatus(streamId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(
      `/streaming/status/${streamId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get stream status');
  }

  async ptzControl(cameraId: string, action: string, params?: any): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(
      `/streaming/ptz/${cameraId}`,
      { action, params }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'PTZ control failed');
  }

  async getPtzPresets(cameraId: string): Promise<any[]> {
    const response = await this.client.get<ApiResponse<{ presets: any[] }>>(
      `/streaming/ptz/${cameraId}/presets`
    );

    if (response.data.success && response.data.data) {
      return response.data.data.presets;
    }

    throw new Error(response.data.error?.message || 'Failed to get PTZ presets');
  }

  async takeSnapshot(cameraId: string, profileId?: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(
      `/streaming/snapshot/${cameraId}`,
      { profileId }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to take snapshot');
  }

  // ============================================================================
  // PLAYBACK
  // ============================================================================

  async getTimeline(
    cameraId: string,
    startTime: string,
    endTime: string,
    resolution?: number
  ): Promise<{ segments: TimelineSegment[]; events?: TimelineEvent[] }> {
    const response = await this.client.get<ApiResponse<any>>(
      `/playback/timeline/${cameraId}`,
      { params: { startTime, endTime, resolution } }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get timeline');
  }

  async startPlayback(request: PlaybackStartRequest): Promise<PlaybackSession> {
    const response = await this.client.post<ApiResponse<PlaybackSession>>(
      '/playback/start',
      request
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to start playback');
  }

  async seekPlayback(sessionId: string, timestamp: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(
      `/playback/seek/${sessionId}`,
      { timestamp }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Seek failed');
  }

  async controlPlayback(
    sessionId: string,
    action: 'play' | 'pause' | 'stop',
    speed?: number
  ): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(
      `/playback/control/${sessionId}`,
      { action, speed }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Playback control failed');
  }

  async frameStep(sessionId: string, direction: 'forward' | 'backward'): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(
      `/playback/frame/${sessionId}`,
      { direction }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Frame step failed');
  }

  async stopPlayback(sessionId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/playback/session/${sessionId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to stop playback');
    }
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  async getEvents(params?: any): Promise<PaginatedResponse<Event>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<Event>>>(
      '/events',
      { params }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get events');
  }

  async acknowledgeEvent(eventId: string): Promise<void> {
    const response = await this.client.post<ApiResponse<{}>>(
      `/events/${eventId}/acknowledge`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to acknowledge event');
    }
  }

  async getEventDetails(eventId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(
      `/events/${eventId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get event details');
  }

  // ============================================================================
  // BOOKMARKS
  // ============================================================================

  async getBookmarks(params?: any): Promise<Bookmark[]> {
    const response = await this.client.get<ApiResponse<{ bookmarks: Bookmark[] }>>(
      '/bookmarks',
      { params }
    );

    if (response.data.success && response.data.data) {
      return response.data.data.bookmarks;
    }

    throw new Error(response.data.error?.message || 'Failed to get bookmarks');
  }

  async createBookmark(request: CreateBookmarkRequest): Promise<Bookmark> {
    const response = await this.client.post<ApiResponse<{ bookmark: Bookmark }>>(
      '/bookmarks',
      request
    );

    if (response.data.success && response.data.data) {
      return response.data.data.bookmark;
    }

    throw new Error(response.data.error?.message || 'Failed to create bookmark');
  }

  async updateBookmark(bookmarkId: string, data: any): Promise<Bookmark> {
    const response = await this.client.put<ApiResponse<{ bookmark: Bookmark }>>(
      `/bookmarks/${bookmarkId}`,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.bookmark;
    }

    throw new Error(response.data.error?.message || 'Failed to update bookmark');
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/bookmarks/${bookmarkId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete bookmark');
    }
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  async createExport(request: CreateExportRequest): Promise<ExportJob> {
    const response = await this.client.post<ApiResponse<{ exportId: string; status: string }>>(
      '/export',
      request
    );

    if (response.data.success && response.data.data) {
      return {
        id: response.data.data.exportId,
        status: response.data.data.status as any,
        cameraId: request.cameraId,
        startTime: request.startTime,
        endTime: request.endTime,
        format: request.format || 'mp4',
        progress: 0,
        createdBy: '',
        createdAt: new Date().toISOString(),
      };
    }

    throw new Error(response.data.error?.message || 'Failed to create export');
  }

  async getExportStatus(exportId: string): Promise<ExportJob> {
    const response = await this.client.get<ApiResponse<ExportJob>>(
      `/export/${exportId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get export status');
  }

  async listExports(params?: any): Promise<PaginatedResponse<ExportJob>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<ExportJob>>>(
      '/export',
      { params }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to list exports');
  }

  async deleteExport(exportId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/export/${exportId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete export');
    }
  }

  // ============================================================================
  // HEALTH
  // ============================================================================

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await this.client.get<ApiResponse<SystemHealth>>(
      '/health'
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get system health');
  }

  async getCamerasHealth(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(
      '/health/cameras'
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get cameras health');
  }

  async getStorageHealth(): Promise<StoragePool[]> {
    const response = await this.client.get<ApiResponse<{ pools: StoragePool[] }>>(
      '/health/storage'
    );

    if (response.data.success && response.data.data) {
      return response.data.data.pools;
    }

    throw new Error(response.data.error?.message || 'Failed to get storage health');
  }

  async getMetrics(): Promise<SystemMetrics> {
    const response = await this.client.get<ApiResponse<SystemMetrics>>(
      '/health/metrics'
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get metrics');
  }

  // ============================================================================
  // SERVER DIRECTORY
  // ============================================================================

  async getServerDirectory(): Promise<DirectoryServer[]> {
    const response = await this.client.get<ApiResponse<{ servers: DirectoryServer[] }>>(
      '/directory/servers'
    );

    if (response.data.success && response.data.data) {
      return response.data.data.servers;
    }

    throw new Error(response.data.error?.message || 'Failed to get server directory');
  }

  async addServerToDirectory(data: any): Promise<DirectoryServer> {
    const response = await this.client.post<ApiResponse<{ server: DirectoryServer }>>(
      '/directory/servers',
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.server;
    }

    throw new Error(response.data.error?.message || 'Failed to add server');
  }

  async removeServerFromDirectory(serverId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/directory/servers/${serverId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to remove server');
    }
  }

  // ============================================================================
  // USERS & ROLES
  // ============================================================================

  async getUsers(params?: any): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<User>>>(
      '/users',
      { params }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to get users');
  }

  async createUser(data: any): Promise<User> {
    const response = await this.client.post<ApiResponse<{ user: User }>>(
      '/users',
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error(response.data.error?.message || 'Failed to create user');
  }

  async updateUser(userId: string, data: any): Promise<User> {
    const response = await this.client.put<ApiResponse<{ user: User }>>(
      `/users/${userId}`,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error(response.data.error?.message || 'Failed to update user');
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/users/${userId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete user');
    }
  }

  async getRoles(): Promise<any[]> {
    const response = await this.client.get<ApiResponse<{ roles: any[] }>>(
      '/roles'
    );

    if (response.data.success && response.data.data) {
      return response.data.data.roles;
    }

    throw new Error(response.data.error?.message || 'Failed to get roles');
  }

  async createRole(data: any): Promise<any> {
    const response = await this.client.post<ApiResponse<{ role: any }>>(
      '/roles',
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.role;
    }

    throw new Error(response.data.error?.message || 'Failed to create role');
  }

  async updateRole(roleId: string, data: any): Promise<any> {
    const response = await this.client.put<ApiResponse<{ role: any }>>(
      `/roles/${roleId}`,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data.role;
    }

    throw new Error(response.data.error?.message || 'Failed to update role');
  }

  async deleteRole(roleId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{}>>(
      `/roles/${roleId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete role');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  setBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let apiClientInstance: ApiClient | null = null;

export function getApiClient(baseURL?: string): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(baseURL);
  }
  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}

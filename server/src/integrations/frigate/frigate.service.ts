import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { DirectoryServerEntity, DetectionEventEntity, CameraEntity, ServerType, BookmarkEntity } from '@/database/entities';
import { StorageService } from '@/shared/services/storage.service';

@Injectable()
export class FrigateService implements OnModuleInit {
  private readonly logger = new Logger(FrigateService.name);
  private tokens = new Map<string, string>(); // serverId -> JWT token
  private timeOffsets = new Map<string, number>(); // serverId -> offset in ms

  constructor(
    private configService: ConfigService,
    @InjectRepository(DirectoryServerEntity)
    private serverRepository: Repository<DirectoryServerEntity>,
    @InjectRepository(DetectionEventEntity)
    private eventRepository: Repository<DetectionEventEntity>,
    @InjectRepository(CameraEntity)
    private cameraRepository: Repository<CameraEntity>,
    @InjectRepository(BookmarkEntity)
    private bookmarkRepository: Repository<BookmarkEntity>,
    private storageService: StorageService,
    private eventEmitter: EventEmitter2,
  ) { }

  async onModuleInit() {
    this.logger.log('Frigate Service initialized. Monitoring servers...');
  }

  /**
   * Generates an Axios client for a specific Frigate server, 
   * handling authentication automatically.
   */
  async getClient(serverId: string): Promise<AxiosInstance> {
    const server = await this.serverRepository.findOne({ where: { id: serverId } });
    if (!server) throw new Error(`Frigate server not found: ${serverId}`);

    const metadata = server.metadata || {};
    const token = this.tokens.get(serverId);

    const client = axios.create({
      baseURL: server.url,
      timeout: 10000,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // Add interceptor to handle token expiration (401)
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && metadata.auth?.mode === 'user_pass') {
          originalRequest._retry = true;
          const newToken = await this.login(serverId);
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return client;
  }

  /**
   * Login to Frigate and get a JWT token
   */
  async login(serverId: string): Promise<string | null> {
    const server = await this.serverRepository.findOne({ where: { id: serverId } });
    if (!server || !server.metadata?.auth) return null;

    const { mode, username, password } = server.metadata.auth;
    if (mode !== 'user_pass') return null;

    try {
      this.logger.log(`Attempting login to Frigate server: ${server.name} (${server.url})`);
      const response = await axios.post(`${server.url}/api/login`, {
        user: username,
        password: password
      });

      if (response.data && response.data.token) {
        this.tokens.set(serverId, response.data.token);
        return response.data.token;
      }

      // Some versions might set a cookie instead of returning a token in body
      // We should check set-cookie headers if needed, but the user mentioned JWT Bearer.
      return null;
    } catch (e) {
      this.logger.error(`Failed to login to Frigate ${server.name}: ${e.message}`);
      return null;
    }
  }

  /**
   * Calculate clock skew with the Frigate server
   */
  async updateTimeOffset(serverId: string) {
    try {
      const client = await this.getClient(serverId);
      const startTime = Date.now();
      const response = await client.get('/api/stats');
      const endTime = Date.now();
      const latency = (endTime - startTime) / 2;

      // Frigate stats doesn't always have server time, but we can use version or others
      // If frigate doesn't provide it, we might need a custom endpoint or just trust NTP
      // For now, let's assume we can get it from headers or a specific field if it exists
      const serverTimeStr = response.headers['date'];
      if (serverTimeStr) {
        const serverTime = new Date(serverTimeStr).getTime();
        const offset = serverTime - (startTime + latency);
        this.timeOffsets.set(serverId, offset);
        this.logger.log(`Time offset for Frigate ${serverId}: ${offset}ms (Latency: ${latency}ms)`);
      }
    } catch (e) {
      this.logger.warn(`Could not sync time with Frigate ${serverId}: ${e.message}`);
    }
  }

  private getAdjustedTime(serverId: string, unixTimestamp: number): Date {
    const offset = this.timeOffsets.get(serverId) || 0;
    return new Date((unixTimestamp * 1000) - offset);
  }

  /**
   * Listen for events coming from MQTT (processed by MqttService)
   */
  @OnEvent('frigate.event')
  async handleMqttEvent(payload: any) {
    const { serverId, before, after, type } = payload;

    // We only process 'after' state for new/updated events
    if (!after || !serverId) return;

    try {
      // Find the camera mapping
      const server = await this.serverRepository.findOneBy({ id: serverId });
      if (!server) return;

      const frigateCamName = after.camera;
      const cameraMap = server.metadata?.camera_map || {};
      const nxCamId = cameraMap[frigateCamName];

      let camera: CameraEntity | null = null;
      if (nxCamId) {
        camera = await this.cameraRepository.findOneBy({ id: nxCamId });
      } else {
        // Fallback: search by name or frigateCameraName field
        camera = await this.cameraRepository.findOne({
          where: [
            { frigateCameraName: frigateCamName },
            { name: frigateCamName, serverId: serverId }
          ]
        });
      }

      // Record the event in our database
      const event = this.eventRepository.create({
        externalId: after.id,
        engine: 'frigate',
        serverId: serverId,
        camera: camera || undefined,
        cameraName: camera?.name || frigateCamName,
        type: after.label,
        score: after.top_score || after.score,
        category: this.mapCategory(after.label),
        severity: 'info',
        startTime: this.getAdjustedTime(serverId, after.start_time),
        endTime: after.end_time ? this.getAdjustedTime(serverId, after.end_time) : undefined,
        hasSnapshot: after.has_snapshot,
        hasClip: after.has_clip,
        box: [after.area?.left, after.area?.top, after.area?.width, after.area?.height],
        attributes: {
          sub_label: after.sub_label,
          zones: after.current_zones || [],
          entered_zones: after.entered_zones || [],
          stationary: after.stationary,
        }
      });

      // Update if exists or create new
      const existing = await this.eventRepository.findOneBy({ externalId: after.id, serverId: serverId });
      if (existing) {
        Object.assign(existing, event);
        await this.eventRepository.save(existing);
      } else {
        await this.eventRepository.save(event);
      }

      this.logger.debug(`Processed Frigate event ${after.id} for camera ${camera?.name || frigateCamName}`);

      // Handle Media Fetching
      if (after.has_snapshot && server.metadata?.media_fetch) {
        this.downloadEventMedia(serverId, after.id, camera?.id || 'unknown');
      }

      // Emit normalized event for other services (Rules, UI etc)
      this.eventEmitter.emit('ai.event.normalized', {
        engine: 'frigate',
        serverId: serverId,
        externalId: after.id,
        type: after.label,
        category: this.mapCategory(after.label),
        cameraId: camera?.id,
        startTime: new Date(after.start_time * 1000),
        score: after.top_score || after.score,
        box: [after.area?.left, after.area?.top, after.area?.width, after.area?.height],
      });
    } catch (e) {
      this.logger.error(`Error handling Frigate MQTT event: ${e.message}`);
    }
  }

  async downloadEventMedia(serverId: string, externalEventId: string, cameraId: string) {
    try {
      const client = await this.getClient(serverId);
      const response = await client.get(`/api/events/${externalEventId}/snapshot.jpg`, {
        responseType: 'arraybuffer'
      });

      if (response.data) {
        const buffer = Buffer.from(response.data);
        const localPath = await this.storageService.saveSnapshot(cameraId, buffer, `frigate_${externalEventId}`);

        // Update the entity with the local path
        await this.eventRepository.update(
          { externalId: externalEventId, serverId: serverId },
          { snapshotPath: localPath }
        );

        this.logger.debug(`Downloaded and cached snapshot for Frigate event ${externalEventId}`);
      }
    } catch (e) {
      this.logger.error(`Failed to download media for Frigate event ${externalEventId}: ${e.message}`);
    }
  }

  /**
   * Listen for review items (Frigate 0.13+)
   */
  @OnEvent('frigate.review')
  async handleReviewEvent(payload: any) {
    const { serverId, before, after } = payload;
    if (!after || !serverId) return;

    try {
      const server = await this.serverRepository.findOneBy({ id: serverId });
      if (!server) return;

      const cameraMap = server.metadata?.camera_map || {};
      const nxCamId = cameraMap[after.camera];

      let camera: CameraEntity | null = null;
      if (nxCamId) {
        camera = await this.cameraRepository.findOneBy({ id: nxCamId });
      }

      // Reviews often contain superior metadata or grouped objects
      // Create an event for the first detection in the review or update existing
      const event = this.eventRepository.create({
        externalId: after.id,
        engine: 'frigate',
        serverId: serverId,
        camera: camera || undefined,
        cameraName: camera?.name || after.camera,
        type: after.severity || 'review',
        score: 1.0,
        category: 'review',
        severity: after.severity === 'alert' ? 'critical' : 'info',
        startTime: this.getAdjustedTime(serverId, after.start_time),
        endTime: after.end_time ? this.getAdjustedTime(serverId, after.end_time) : undefined,
        hasSnapshot: true,
        hasClip: true,
        attributes: {
          data: after.data,
          sub_label: after.sub_label,
        }
      });

      const existing = await this.eventRepository.findOneBy({ externalId: after.id, serverId: serverId });
      if (existing) {
        Object.assign(existing, event);
        await this.eventRepository.save(existing);
      } else {
        await this.eventRepository.save(event);
      }

      // Create automatic bookmark for Alerts
      if (after.severity === 'alert' && camera) {
        await this.createAutomaticBookmark(camera.id, event);
      }

      this.logger.debug(`Processed Frigate review ${after.id} for camera ${camera?.name || after.camera}`);
    } catch (e) {
      this.logger.error(`Error handling Frigate Review event: ${e.message}`);
    }
  }

  async createAutomaticBookmark(cameraId: string, event: DetectionEventEntity) {
    try {
      const bookmark = this.bookmarkRepository.create({
        name: `Frigate Alert: ${event.type}`,
        description: `Automated bookmark from Frigate AI detection. Score: ${Math.round(event.score * 100)}%`,
        startTime: event.startTime,
        endTime: event.endTime || new Date(event.startTime.getTime() + 10000),
        cameraId: cameraId,
        tags: ['frigate', 'ai-detection', event.type],
        createdById: '00000000-0000-0000-0000-000000000000', // System user or dedicated AI user
      });
      await this.bookmarkRepository.save(bookmark);
      this.logger.log(`Created automatic bookmark for Frigate alert on camera ${cameraId}`);
    } catch (e) {
      this.logger.error(`Failed to create automatic bookmark: ${e.message}`);
    }
  }

  /**
   * Sync historical events from Frigate
   */
  async syncHistoricalEvents(serverId: string, daysBack: number = 1) {
    try {
      const client = await this.getClient(serverId);
      const startTime = Math.floor((Date.now() - (daysBack * 24 * 60 * 60 * 1000)) / 1000);

      const response = await client.get('/api/events', {
        params: {
          after: startTime,
          limit: 100
        }
      });

      if (Array.isArray(response.data)) {
        this.logger.log(`Syncing ${response.data.length} historical events from Frigate ${serverId}...`);
        for (const event of response.data) {
          // Reuse handleMqttEvent logic or similar
          await this.handleMqttEvent({
            serverId,
            after: event,
            type: 'sync'
          });
        }
      }
    } catch (e) {
      this.logger.error(`Failed to sync historical events: ${e.message}`);
    }
  }

  /**
   * Handle Frigate availability
   */
  @OnEvent('frigate.available')
  async handleAvailability(payload: { status: string; serverId: string }) {
    const { status, serverId } = payload;
    try {
      const server = await this.serverRepository.findOneBy({ id: serverId });
      if (server) {
        const newStatus = status === 'online' ? 'online' : 'offline';
        if (server.status !== (newStatus as any)) {
          await this.serverRepository.update(serverId, {
            status: newStatus as any,
            lastSeen: new Date()
          });
          this.logger.log(`Frigate server ${server.name} status updated to: ${newStatus}`);
        }
      }
    } catch (e) {
      this.logger.error(`Error updating Frigate availability: ${e.message}`);
    }
  }

  private mapCategory(label: string): string {
    const categories: Record<string, string[]> = {
      person: ['person', 'face'],
      vehicle: ['car', 'bus', 'truck', 'motorcycle', 'bicycle'],
      animal: ['dog', 'cat', 'bird', 'cow'],
    };

    for (const [cat, labels] of Object.entries(categories)) {
      if (labels.includes(label.toLowerCase())) return cat;
    }
    return 'object_detection';
  }

  // Proxy methods (Legacy support or internal use)
  async getEvents(serverId: string, params?: any) {
    const client = await this.getClient(serverId);
    const response = await client.get('/api/events', { params });
    return response.data;
  }

  async getStats(serverId: string) {
    const client = await this.getClient(serverId);
    const response = await client.get('/api/stats');
    return response.data;
  }

  async getConfig(serverId: string) {
    const client = await this.getClient(serverId);
    const response = await client.get('/api/config');
    return response.data;
  }
}

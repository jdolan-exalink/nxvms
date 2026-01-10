import { Injectable, Logger } from "@nestjs/common";
import * as onvif from "onvif";

@Injectable()
export class OnvifService {
  private readonly logger = new Logger(OnvifService.name);

  async discoverCameras(timeout = 5000): Promise<any[]> {
    return new Promise((resolve) => {
      const cameras: any[] = [];

      this.logger.log("Starting ONVIF discovery...");

      onvif.Discovery.on("device", (cam) => {
        this.logger.log(`Discovered camera: ${cam.hostname}`);
        cameras.push({
          hostname: cam.hostname,
          port: cam.port,
          address: cam.address,
          service: cam.service,
          device: cam.device
        });
      });

      onvif.Discovery.probe({ timeout }, (err) => {
        if (err) {
          this.logger.error("Discovery error:", err);
        }
        this.logger.log(`Discovery completed. Found ${cameras.length} cameras.`);
        resolve(cameras);
      });
    });
  }

  async probeSpecificIp(ip: string, port = 80, timeout = 3000): Promise<any | null> {
    return new Promise((resolve) => {
      this.logger.log(`Probing specific IP: ${ip}:${port}`);

      const cam = new onvif.Cam({
        hostname: ip,
        port: port,
        timeout: timeout
      }, (err) => {
        if (err) {
          this.logger.error(`Failed to probe ${ip}: ${err.message}`);
          resolve(null);
        } else {
          this.logger.log(`Successfully reached ONVIF device at ${ip}`);
          resolve({
            hostname: ip,
            port: port,
            device: cam.deviceInformation
          });
        }
      });
    });
  }


  async getCameraProfiles(hostname: string, username?: string, password?: string): Promise<any[]> {
    try {
      const cam = new onvif.Cam({
        hostname,
        username,
        password,
      });

      const profiles = await new Promise<any[]>((resolve, reject) => {
        cam.getProfiles((err, profiles) => {
          if (err) return reject(err);
          resolve(Array.isArray(profiles) ? profiles : []);
        });
      });

      return profiles || [];
    } catch (error) {
      this.logger.error(`Failed to get profiles for ${hostname}:`, error);
      return [];
    }
  }

  async getStreamUri(hostname: string, profileToken: string, username?: string, password?: string): Promise<string | null> {
    try {
      const cam = new onvif.Cam({
        hostname,
        username,
        password,
      });

      return await new Promise((resolve, reject) => {
        cam.getStreamUri({ protocol: "RTSP", profileToken }, (err, stream) => {
          if (err) return reject(err);
          resolve(stream.uri);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to get stream URI for ${hostname}:`, error);
      return null;
    }
  }

  /**
   * Conceptual implementation for ONVIF Event Subscription
   * In a real environment, this would set up a PullPoint or a Webhook.
   */
  async subscribeToEvents(cameraId: string, credentials: any, eventEmitter: any) {
    this.logger.log(`Subscribing to ONVIF events for camera ${cameraId}...`);

    const cam = new onvif.Cam({
      hostname: credentials.address,
      username: credentials.username,
      password: credentials.password
    }, (err) => {
      if (err) {
        this.logger.error(`Event subscription pre-check failed for camera ${cameraId}: ${err.message}`);
        return;
      }

      // Conceptual: Listen for 'event' or use getEventService
      cam.on('event', (data: any) => {
        this.logger.debug(`ONVIF Raw Event from ${cameraId}: ${JSON.stringify(data)}`);

        // Normalize ONVIF Motion
        if (data.topic && data.topic.includes('RuleEngine/CellMotionDetector')) {
          const event = {
            engine: 'onvif',
            category: 'perimeter',
            severity: 'warning',
            type: 'motion',
            externalId: `onvif_${Date.now()}`,
            cameraId: cameraId,
            score: 1.0,
            startTime: new Date()
          };
          eventEmitter.emit('ai.event.normalized', event);
        }
      });
    });
  }

  async getSnapshotUri(hostname: string, profileToken: string, username?: string, password?: string): Promise<string | null> {
    try {
      const cam = new onvif.Cam({
        hostname,
        username,
        password,
      });

      return await new Promise((resolve, reject) => {
        cam.getSnapshotUri({ profileToken }, (err, res) => {
          if (err) return reject(err);
          resolve(res.uri);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to get snapshot URI for ${hostname}:`, error);
      return null;
    }
  }
}

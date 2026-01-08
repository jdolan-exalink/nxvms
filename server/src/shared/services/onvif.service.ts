import { Injectable, Logger } from '@nestjs/common';
import { Onvif } from 'onvif';

@Injectable()
export class OnvifService {
  private readonly logger = new Logger(OnvifService.name);

  async discoverCameras(timeout = 5000): Promise<any[]> {
    return new Promise((resolve) => {
      const cameras: any[] = [];

      const onvif = new Onvif({
        discoveryTimeout: timeout,
      });

      onvif.on('device', (cam) => {
        this.logger.log(`Discovered camera: ${cam.hostname}`);
        cameras.push({
          hostname: cam.hostname,
          port: cam.port,
          username: cam.username,
          password: cam.password,
        });
      });

      onvif.on('complete', () => {
        this.logger.log(`Discovery completed. Found ${cameras.length} cameras.`);
        resolve(cameras);
      });

      onvif.start();
    });
  }

  async getCameraProfiles(hostname: string, username?: string, password?: string): Promise<any[]> {
    try {
      const onvif = new Onvif({
        hostname,
        username,
        password,
      });

      const profiles = await new Promise<any[]>((resolve) => {
        onvif.GetProfiles((err, profiles) => {
          resolve(err ? [] : (Array.isArray(profiles) ? profiles : []));
        });
      });

      return profiles || [];
    } catch (error) {
      this.logger.error(`Error getting profiles: ${error.message}`);
      return [];
    }
  }

  async getStreamUri(
    hostname: string,
    profileToken: string,
    username?: string,
    password?: string,
  ): Promise<string | null> {
    try {
      const onvif = new Onvif({
        hostname,
        username,
        password,
      });

      const streamUri = await new Promise<string | null>((resolve) => {
        onvif.GetStreamUri({ profileToken }, (err, stream) => {
          if (err) {
            resolve(null);
          } else {
            resolve(stream?.uri || null);
          }
        });
      });

      return streamUri;
    } catch (error) {
      this.logger.error(`Error getting stream URI: ${error.message}`);
      return null;
    }
  }
}

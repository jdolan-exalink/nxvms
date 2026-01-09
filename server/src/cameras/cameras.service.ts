import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CameraEntity, StreamEntity, CameraStatus, StreamType, DirectoryServerEntity } from '@/database/entities';
import { CreateCameraDto, UpdateCameraDto } from './dto/camera.dto';
import { FFmpegService, OnvifService, StorageService } from '@/shared/services';
import { FrigateService } from '@/integrations/frigate/frigate.service';

@Injectable()
export class CamerasService {
  private readonly logger = new Logger(CamerasService.name);

  constructor(
    @InjectRepository(CameraEntity)
    private cameraRepository: Repository<CameraEntity>,
    @InjectRepository(StreamEntity)
    private streamRepository: Repository<StreamEntity>,
    @InjectRepository(DirectoryServerEntity)
    private serverRepository: Repository<DirectoryServerEntity>,
    private ffmpegService: FFmpegService,
    private onvifService: OnvifService,
    private storageService: StorageService,
    private frigateService: FrigateService,
  ) {}

  async createCamera(createCameraDto: CreateCameraDto, userId: string, serverId?: string): Promise<CameraEntity> {
    const camera = this.cameraRepository.create({
      ...createCameraDto,
      serverId,
      createdById: userId,
      status: CameraStatus.OFFLINE,
    });

    const savedCamera = await this.cameraRepository.save(camera);

    // Create default RTSP stream if URL provided
    if (createCameraDto.rtspUrl) {
      const stream = this.streamRepository.create({
        cameraId: savedCamera.id,
        type: StreamType.RTSP,
        url: createCameraDto.rtspUrl,
        profileName: 'main',
      });
      await this.streamRepository.save(stream);
    }

    return savedCamera;
  }

  async importFromFrigate(serverId: string, userId: string): Promise<CameraEntity[]> {
    const server = await this.serverRepository.findOneBy({ id: serverId });
    if (!server) throw new NotFoundException('Frigate server not found');

    this.logger.log(`Importing cameras from Frigate server: ${server.name} (${server.url})`);
    
    let frigateConfig;
    try {
      frigateConfig = await this.frigateService.getConfig(server.url);
    } catch (error) {
      this.logger.error(`Import failed: Could not reach Frigate at ${server.url}`);
      throw new BadRequestException(`No se pudo conectar con Frigate en ${server.url}. Verifique la URL.`);
    }

    const cameras = frigateConfig.cameras || {};
    const importedCameras: CameraEntity[] = [];

    const cameraNames = Object.keys(cameras);
    this.logger.log(`[FRIGATE IMPORT] Processing ${cameraNames.length} cameras from config...`);

    let newCount = 0;
    let updatedCount = 0;

    for (const [name, config] of Object.entries<any>(cameras)) {
      try {
        this.logger.log(`[FRIGATE IMPORT] Analyzing camera: "${name}"`);
        
        // 1. Check if already exists (by name and serverId)
        let camera = await this.cameraRepository.findOne({ 
          where: [
            { serverId, frigateCameraName: name },
            { frigateCameraName: name, serverId: null } // Also catch orphans
          ]
        });

        if (!camera) {
          this.logger.log(`[FRIGATE IMPORT] Creating NEW camera record for "${name}"`);
          camera = this.cameraRepository.create({
            name: name,
            serverId, // Assign to this server
            provider: 'frigate',
            frigateCameraName: name,
            manufacturer: 'Frigate',
            status: CameraStatus.ONLINE,
            createdById: userId,
            description: `Imported from Frigate: ${name}`,
            capabilities: {
              audio: true, // Default to true for Frigate to allow attempting playback
              ptz: false,
              digitalZoom: true,
              motionDetection: true,
            } as any
          });
          newCount++;
        } else {
          this.logger.log(`[FRIGATE IMPORT] Updating EXISTING camera record for "${name}" (ID: ${camera.id})`);
          camera.serverId = serverId; // Ensure it's linked
          camera.status = CameraStatus.ONLINE;
          camera.provider = 'frigate';
          // Ensure capabilities object exists
          if (!camera.capabilities) {
            camera.capabilities = { audio: true, digitalZoom: true } as any;
          } else {
            (camera.capabilities as any).audio = true;
          }
          updatedCount++;
        }

        camera = await this.cameraRepository.save(camera);
        
        // 2. Manage Streams (Clear and recreate to ensure they match latest proxy logic)
        // We'll check if streams already exist to avoid duplication
        const existingStreams = await this.streamRepository.findBy({ cameraId: camera.id });
        
        if (existingStreams.length === 0) {
          this.logger.log(`[FRIGATE IMPORT] Generating default streams for "${name}"...`);
          
          const streamsToCreate = [
            {
              type: StreamType.FRIGATE_MSE,
              url: `/api/v1/frigate/proxy/${serverId}/api/go2rtc/api/stream.mp4?src=${name}_main`,
              profileName: 'Live (MSE Content)',
            },
            {
              type: StreamType.HLS,
              url: `/api/v1/frigate/proxy/${serverId}/api/go2rtc/api/stream.m3u8?src=${name}_main`,
              profileName: 'Live (HLS)',
            },
            {
              type: StreamType.WEBRTC,
              url: `/api/v1/frigate/proxy/${serverId}/api/go2rtc/api/webrtc?src=${name}_main`,
              profileName: 'Live (WebRTC)',
            }
          ];

          for (const sData of streamsToCreate) {
            const stream = this.streamRepository.create({
              ...sData,
              cameraId: camera.id,
            });
            await this.streamRepository.save(stream);
          }
        } else {
          this.logger.log(`[FRIGATE IMPORT] Camera "${name}" already has ${existingStreams.length} streams. Skipping stream creation.`);
          // Update existing stream URLs to use the latest go2rtc proxy paths
          for (const stream of existingStreams) {
            if (stream.type === StreamType.FRIGATE_MSE) {
              stream.url = `/api/v1/frigate/proxy/${serverId}/api/go2rtc/api/stream.mp4?src=${name}_main`;
              await this.streamRepository.save(stream);
            } else if (stream.type === StreamType.HLS) {
              stream.url = `/api/v1/frigate/proxy/${serverId}/api/go2rtc/api/stream.m3u8?src=${name}_main`;
              await this.streamRepository.save(stream);
            }
          }
        }

        importedCameras.push(camera);
      } catch (err) {
        this.logger.error(`[FRIGATE IMPORT] CRITICAL FAILED to process camera "${name}": ${err.message}`);
        this.logger.error(err.stack);
      }
    }

    this.logger.log(`[FRIGATE IMPORT] COMPLETED. New: ${newCount}, Updated: ${updatedCount}, Total: ${importedCameras.length}`);
    return importedCameras;
  }

  async connectOnvif(dto: { address: string; username?: string; password?: string; serverId?: string }, userId: string): Promise<CameraEntity> {
    const profiles = await this.onvifService.getCameraProfiles(dto.address, dto.username, dto.password);
    
    if (!profiles || profiles.length === 0) {
      throw new BadRequestException('Could not retrieve ONVIF profiles from camera');
    }

    // Use first profile for default stream
    const mainProfile = profiles[0];
    const streamUri = await this.onvifService.getStreamUri(dto.address, mainProfile.token || mainProfile.$.token, dto.username, dto.password);

    const camera = this.cameraRepository.create({
      name: `ONVIF ${dto.address}`,
      serverId: dto.serverId,
      onvifId: mainProfile.token || mainProfile.$.token,
      manufacturer: mainProfile.videoEncoderConfiguration?.encoding || 'ONVIF',
      rtspUrl: streamUri,
      provider: 'onvif',
      status: CameraStatus.ONLINE,
      createdById: userId,
      description: `Discovered ONVIF device with ${profiles.length} profiles`
    });

    const savedCamera = await this.cameraRepository.save(camera);

    // Save all profiles as streams
    for (const profile of profiles) {
      const uri = await this.onvifService.getStreamUri(dto.address, profile.token || profile.$.token, dto.username, dto.password);
      if (uri) {
        const stream = this.streamRepository.create({
          cameraId: savedCamera.id,
          type: StreamType.RTSP,
          url: uri,
          profileName: profile.name || profile.token || 'main',
          resolution: profile.videoEncoderConfiguration?.resolution ? 
            `${profile.videoEncoderConfiguration.resolution.width}x${profile.videoEncoderConfiguration.resolution.height}` : 
            undefined,
        });
        await this.streamRepository.save(stream);
      }
    }

    return savedCamera;
  }

  async getAllCameras(serverId?: string): Promise<CameraEntity[]> {
    const where = serverId ? { serverId } : {};
    return this.cameraRepository.find({
      where,
      relations: ['streams'],
    });
  }

  async getAllServers(): Promise<DirectoryServerEntity[]> {
    return this.serverRepository.find({
      order: { name: 'ASC' }
    });
  }

  async getCameraById(cameraId: string): Promise<CameraEntity> {
    const camera = await this.cameraRepository.findOne({
      where: { id: cameraId },
      relations: ['streams', 'recordingSegments'],
    });

    if (!camera) {
      throw new NotFoundException('Camera not found');
    }

    return camera;
  }

  async updateCamera(cameraId: string, updateCameraDto: UpdateCameraDto, userId: string): Promise<CameraEntity> {
    const camera = await this.getCameraById(cameraId);

    Object.assign(camera, updateCameraDto);
    const updated = await this.cameraRepository.save(camera);

    return updated;
  }

  async deleteCamera(cameraId: string, userId: string): Promise<void> {
    const camera = await this.getCameraById(cameraId);

    // Delete storage
    await this.storageService.deleteDirectory(this.storageService.getCameraStoragePath(cameraId));

    // Delete from DB
    await this.cameraRepository.remove(camera);
  }

  async startRecording(cameraId: string, userId: string): Promise<void> {
    const camera = await this.getCameraById(cameraId);

    camera.isRecording = true;
    camera.status = CameraStatus.RECORDING;
    await this.cameraRepository.save(camera);
  }

  async stopRecording(cameraId: string, userId: string): Promise<void> {
    const camera = await this.getCameraById(cameraId);

    camera.isRecording = false;
    camera.status = CameraStatus.ONLINE;
    await this.cameraRepository.save(camera);
  }

  async discoverCameras(serverId?: string, timeout = 5000): Promise<any[]> {
    // 1. Try standard WS-Discovery (Multicast)
    const discoveryResults = await this.onvifService.discoverCameras(timeout);
    
    // 2. If a serverId is provided, try picking up the IP of that server as a hint
    // This helps if multicast discovery is failing across docker networks
    if (serverId) {
      const server = await this.serverRepository.findOneBy({ id: serverId });
      if (server) {
        try {
          // Parse hostname/IP from URL
          const urlStr = server.url.startsWith('http') ? server.url : `http://${server.url}`;
          const url = new URL(urlStr);
          const ip = url.hostname;
          
          if (ip && ip !== 'localhost' && ip !== '127.0.0.1' && ip !== 'frigate') {
            const directResult = await this.onvifService.probeSpecificIp(ip);
            if (directResult && !discoveryResults.some(c => c.hostname === ip)) {
              discoveryResults.push(directResult);
            }
          }
        } catch (e) {
          this.logger.error(`Failed to parse server URL for discovery hint: ${e.message}`);
        }
      }
    }

    return discoveryResults;
  }


  async setDetection(cameraId: string, enabled: boolean): Promise<CameraEntity> {
    const camera = await this.getCameraById(cameraId);
    camera.detectionEnabled = enabled;
    return this.cameraRepository.save(camera);
  }
}

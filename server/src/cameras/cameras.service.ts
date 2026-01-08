import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CameraEntity, StreamEntity, CameraStatus, StreamType } from '@/database/entities';
import { CreateCameraDto, UpdateCameraDto } from './dto/camera.dto';
import { FFmpegService, OnvifService, StorageService } from '@/shared/services';

@Injectable()
export class CamerasService {
  constructor(
    @InjectRepository(CameraEntity)
    private cameraRepository: Repository<CameraEntity>,
    @InjectRepository(StreamEntity)
    private streamRepository: Repository<StreamEntity>,
    private ffmpegService: FFmpegService,
    private onvifService: OnvifService,
    private storageService: StorageService,
  ) {}

  async createCamera(createCameraDto: CreateCameraDto, userId: string, serverId: string): Promise<CameraEntity> {
    const camera = this.cameraRepository.create({
      ...createCameraDto,
      serverId,
      createdById: userId,
      status: CameraStatus.OFFLINE,
    });

    const savedCamera = await this.cameraRepository.save(camera);

    // Create default RTSP stream
    const stream = this.streamRepository.create({
      cameraId: savedCamera.id,
      type: StreamType.RTSP,
      url: createCameraDto.rtspUrl,
      profileName: 'main',
    });

    await this.streamRepository.save(stream);

    return savedCamera;
  }

  async getAllCameras(serverId: string): Promise<CameraEntity[]> {
    return this.cameraRepository.find({
      where: { serverId },
      relations: ['streams'],
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

  async discoverCameras(timeout = 5000): Promise<any[]> {
    return this.onvifService.discoverCameras(timeout);
  }
}

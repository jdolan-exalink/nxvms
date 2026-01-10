import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CameraEntity, CameraStatus, StreamType } from '@/database/entities';
import { FFmpegService } from '@/shared/services';

@Injectable()
export class StatusMonitorService implements OnModuleInit {
    private readonly logger = new Logger(StatusMonitorService.name);

    constructor(
        @InjectRepository(CameraEntity)
        private cameraRepository: Repository<CameraEntity>,
        private ffmpegService: FFmpegService,
    ) { }

    onModuleInit() {
        this.logger.log('Camera Status Monitor initialized.');
        // Check all cameras every 30 seconds
        setInterval(() => this.checkAllCameras(), 30000);

        // Initial check
        setTimeout(() => this.checkAllCameras(), 5000);
    }

    async checkAllCameras() {
        this.logger.debug('Running global camera health check...');
        try {
            const cameras = await this.cameraRepository.find({ relations: ['streams'] });

            for (const camera of cameras) {
                // Determine source to probe
                const rtspUrl = camera.rtspUrl || camera.streams.find(s => s.type === StreamType.RTSP)?.url;

                if (!rtspUrl) continue;

                try {
                    // Try ffprobe with a short timeout
                    await this.ffmpegService.getStreamInfo(rtspUrl);

                    if (camera.status === CameraStatus.OFFLINE || camera.status === CameraStatus.ERROR || camera.status === CameraStatus.DISCONNECTED) {
                        this.logger.log(`Camera ${camera.name} is back ONLINE.`);
                        await this.cameraRepository.update(camera.id, {
                            status: camera.isRecording ? CameraStatus.RECORDING : CameraStatus.ONLINE
                        });
                    }
                } catch (err) {
                    if (camera.status !== CameraStatus.OFFLINE && camera.status !== CameraStatus.ERROR) {
                        this.logger.warn(`Camera ${camera.name} went OFFLINE: ${err.message}`);
                        await this.cameraRepository.update(camera.id, { status: CameraStatus.OFFLINE });
                    }
                }
            }
        } catch (err) {
            this.logger.error(`Status monitor cycle failed: ${err.message}`);
        }
    }
}

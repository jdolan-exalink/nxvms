import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CameraEntity, RecordingSegmentEntity } from '@/database/entities';
import { StorageService } from './storage.service';
import * as fs from 'fs/promises';

@Injectable()
export class RetentionService implements OnModuleInit {
    private readonly logger = new Logger(RetentionService.name);

    constructor(
        @InjectRepository(CameraEntity)
        private cameraRepository: Repository<CameraEntity>,
        @InjectRepository(RecordingSegmentEntity)
        private segmentRepository: Repository<RecordingSegmentEntity>,
        private storageService: StorageService,
    ) { }

    onModuleInit() {
        this.logger.log('Retention Service initialized. Storage janitor is active.');

        // Run every hour
        setInterval(() => this.handleRetention(), 3600000);

        // Initial evaluation after a short delay
        setTimeout(() => this.handleRetention(), 10000);
    }

    async handleRetention() {
        this.logger.log('Starting scheduled retention cleanup (FIFO)...');
        try {
            const cameras = await this.cameraRepository.find();

            for (const camera of cameras) {
                await this.cleanupCameraRecordings(camera);
            }
        } catch (err) {
            this.logger.error(`Retention cleanup failed: ${err.message}`);
        }
    }

    private async cleanupCameraRecordings(camera: CameraEntity) {
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - camera.retentionDays);

        // Find segments older than retention period
        // We join with stream to get camera association if needed, 
        // but segments are usually per stream.
        // For simplicity, we query directly by startTime and link it to camera via Streams.

        // Actually, RecordingSegmentEntity has streamId. We need to find segments for this camera's streams.
        const segments = await this.segmentRepository.createQueryBuilder('segment')
            .innerJoin('segment.stream', 'stream')
            .where('stream.cameraId = :cameraId', { cameraId: camera.id })
            .andWhere('segment.startTime < :retentionDate', { retentionDate })
            .andWhere('segment.isArchived = false') // Don't delete archived evidence
            .getMany();

        if (segments.length === 0) return;

        this.logger.log(`Cleaning up ${segments.length} expired segments for camera ${camera.name} (Retention: ${camera.retentionDays} days)`);

        for (const segment of segments) {
            try {
                // Delete file from disk
                await fs.unlink(segment.filePath).catch(e => {
                    this.logger.warn(`Could not delete file ${segment.filePath}: ${e.message}`);
                });

                // Delete record from DB
                await this.segmentRepository.remove(segment);
            } catch (err) {
                this.logger.error(`Failed to delete segment ${segment.id}: ${err.message}`);
            }
        }
    }
}

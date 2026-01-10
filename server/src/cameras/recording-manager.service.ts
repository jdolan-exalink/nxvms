import { Injectable, Logger, OnModuleDestroy, OnApplicationBootstrap } from '@nestjs/common';
import { FFmpegService, StorageService } from '@/shared/services';
import * as fs from 'fs/promises';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocationEntity, RecordingSegmentEntity, StreamEntity, RecordingType, CameraEntity, RecordingMode, StreamType } from '@/database/entities';
import * as chokidar from 'chokidar';
import * as path from 'path';

@Injectable()
export class RecordingManagerService implements OnModuleDestroy, OnApplicationBootstrap {
    private readonly logger = new Logger(RecordingManagerService.name);
    private activeRecordings = new Map<string, {
        command: any;
        outputDir: string;
        storageLocationId?: string;
        startTime: Date;
        watcher?: chokidar.FSWatcher;
    }>();

    constructor(
        private ffmpegService: FFmpegService,
        private storageService: StorageService,
        @InjectRepository(StorageLocationEntity)
        private locationRepository: Repository<StorageLocationEntity>,
        @InjectRepository(RecordingSegmentEntity)
        private segmentRepository: Repository<RecordingSegmentEntity>,
        @InjectRepository(StreamEntity)
        private streamRepository: Repository<StreamEntity>,
        @InjectRepository(CameraEntity)
        private cameraRepository: Repository<CameraEntity>,
    ) { }

    onApplicationBootstrap() {
        // Run recording check every 10 seconds
        setInterval(() => this.ensureRecordingState(), 10000);
    }

    onModuleDestroy() {
        this.logger.log('Shutting down Recording Manager. Stopping all active FFmpeg processes...');
        for (const cameraId of this.activeRecordings.keys()) {
            this.stop(cameraId);
        }
    }

    private async ensureRecordingState() {
        try {
            const cameras = await this.cameraRepository.find({ relations: ['streams', 'server'] });

            for (const camera of cameras) {
                const isActive = this.isActive(camera.id);
                const shouldRecord = camera.recordingMode === RecordingMode.ALWAYS ||
                    camera.recordingMode === RecordingMode.MOTION_ONLY ||
                    camera.recordingMode === RecordingMode.OBJECTS;

                if (shouldRecord && !isActive) {
                    this.logger.log(`[Auto-Record] Processing camera ${camera.name} for recording...`);

                    let finalUrl = camera.rtspUrl;
                    let tuning = {};

                    // [Priority] 1. RTSP Stream, 2. Specified rtspUrl, 3. First available stream
                    const streams = camera.streams || [];
                    const rtspStream = streams.find(s => s.type === StreamType.RTSP);
                    const stream = rtspStream || streams.find(s => s.url === camera.rtspUrl) || streams[0];

                    if (stream) {
                        finalUrl = stream.url;
                        tuning = stream.tuning || {};
                    }

                    // [FORCED AUTO-FIX] If Frigate, IGNORE whatever is in finalUrl if it's not a valid RTSP link, 
                    // and try to build it from server info.
                    if (camera.provider === 'frigate' && (!finalUrl || finalUrl.startsWith('/') || finalUrl.includes('proxy'))) {
                        if (camera.server && camera.frigateCameraName) {
                            try {
                                const url = new URL(camera.server.url);
                                finalUrl = `rtsp://${url.hostname}:8554/${camera.frigateCameraName}_main`;
                                this.logger.log(`[RecordingManager] Reconstructed RTSP SOURCE for Frigate ${camera.name}: ${finalUrl}`);
                            } catch (e) {
                                this.logger.error(`[RecordingManager] Could not reconstruct URL for ${camera.name}: ${e.message}`);
                            }
                        } else {
                            this.logger.warn(`[RecordingManager] Cannot fix ${camera.name}: server or frigate name missing`);
                        }
                    }

                    if (finalUrl && (finalUrl.startsWith('rtsp://') || finalUrl.startsWith('http://'))) {
                        await this.start(camera.id, finalUrl, camera.serverId, tuning);
                    } else {
                        this.logger.warn(`[RecordingManager] No valid source for ${camera.name}. URL: ${finalUrl}, Streams count: ${streams.length}`);
                    }
                } else if (!shouldRecord && isActive) {
                    // Stop if mode is NEVER or DO_NOT_RECORD, but keep running if defined as Motion/Objects 
                    // (Assuming Motion/Objects might be triggered externally, we don't want to kill it here unless we are sure it wasn't triggered by an event)
                    // actually, for now, if it's not ALWAYS, we stop it here to respect "changes".
                    // But if an event is recording, we shouldn't kill it. 
                    // Needs complex logic. For now, strict enforcement: Only ALWAYS runs continuously.
                    // If Motion recording is implemented, it would likely use a different mechanism or update the state.

                    // For the user request "controls que este grabando", checking strictly for ALWAYS is key.
                    if (camera.recordingMode === RecordingMode.DO_NOT_RECORD) {
                        this.logger.log(`[Auto-Record] Stopping recording for camera ${camera.name} (Mode changed to OFF)`);
                        this.stop(camera.id);
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Error in recording state loop: ${error.message}`);
        }
    }

    async start(cameraId: string, rtspUrl: string, serverId?: string, tuning?: any) {
        if (this.activeRecordings.has(cameraId)) {
            return;
        }

        this.logger.log(`Spawning FFmpeg recording process for camera ${cameraId} (Server: ${serverId || 'local'})`);

        try {
            const outputDir = await this.storageService.getBestStoragePath(cameraId, serverId || 'local');
            await fs.mkdir(outputDir, { recursive: true });

            // Find which storage location this path belongs to
            const location = await this.locationRepository.findOne({
                where: { serverId: serverId || 'local', enabled: true }
            });

            // Find main stream ID for this camera
            const stream = await this.streamRepository.findOne({ where: { cameraId } });

            const command = this.ffmpegService.recordStream(rtspUrl, outputDir, 60, tuning);

            this.activeRecordings.set(cameraId, {
                command,
                outputDir,
                storageLocationId: location?.id,
                startTime: new Date()
            });

            // Start indexing watcher for this directory
            this.startIndexingWatcher(cameraId, stream?.id, outputDir, location?.id);

        } catch (err) {
            this.logger.error(`Failed to start recording for camera ${cameraId}: ${err.message}`);
        }
    }

    private startIndexingWatcher(cameraId: string, streamId: string, outputDir: string, storageLocationId?: string) {
        this.logger.log(`Starting FS Watcher for camera ${cameraId} in ${outputDir}`);

        const watcher = chokidar.watch(outputDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            }
        });

        watcher.on('add', (filePath) => {
            if (filePath.endsWith('.ts')) {
                this.indexNewFile(cameraId, streamId, filePath, storageLocationId);
            }
        });

        const rec = this.activeRecordings.get(cameraId);
        if (rec) rec.watcher = watcher;
    }

    private async indexNewFile(cameraId: string, streamId: string, filePath: string, storageLocationId?: string) {
        try {
            this.logger.debug(`Archive Index: New segment detected at ${filePath}`);

            // Wait a tiny bit to ensure file is closed and has size
            const stats = await fs.stat(filePath);

            // Parse timestamp from filename (seg_YYYYMMDD_HHMMSS.ts)
            const filename = path.basename(filePath);
            const tsMatch = filename.match(/seg_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);

            let startTime = new Date();
            if (tsMatch) {
                startTime = new Date(
                    parseInt(tsMatch[1]),
                    parseInt(tsMatch[2]) - 1,
                    parseInt(tsMatch[3]),
                    parseInt(tsMatch[4]),
                    parseInt(tsMatch[5]),
                    parseInt(tsMatch[6])
                );
            }

            const segment = this.segmentRepository.create({
                streamId,
                storageLocationId,
                startTime,
                endTime: new Date(startTime.getTime() + 60000), // Approximate 60s
                filePath,
                fileSize: stats.size,
                type: RecordingType.CONTINUOUS,
                duration: 60,
                isArchived: false
            });

            await this.segmentRepository.save(segment);
            this.logger.log(`Archive Index: Indexed segment ${segment.id} for camera ${cameraId}`);
        } catch (err) {
            this.logger.error(`Failed to index recording segment ${filePath}: ${err.message}`);
        }
    }

    stop(cameraId: string) {
        const rec = this.activeRecordings.get(cameraId);
        if (rec) {
            this.logger.log(`Killing FFmpeg recording process for camera ${cameraId}`);
            if (rec.watcher) rec.watcher.close();

            try {
                rec.command.kill('SIGTERM');
            } catch (e) {
                this.logger.error(`Error killing FFmpeg process: ${e.message}`);
                try { rec.command.kill('SIGKILL'); } catch (e2) { }
            }
            this.activeRecordings.delete(cameraId);
        }
    }

    isActive(cameraId: string): boolean {
        return this.activeRecordings.has(cameraId);
    }
}

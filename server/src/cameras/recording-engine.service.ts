import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { RecordingMode } from '../database/entities/recording-schedule.entity';

@Injectable()
export class RecordingEngineService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RecordingEngineService.name);
    private checkInterval: NodeJS.Timeout;

    constructor(private camerasService: CamerasService) { }

    onModuleInit() {
        this.logger.log('Recording Engine initialized. Starting scheduler motor...');
        // Check every minute to see if we need to change recording mode
        this.checkInterval = setInterval(() => this.evaluateSchedules(), 60000);

        // Initial evaluation after a short delay to ensure everything is up
        setTimeout(() => this.evaluateSchedules(), 5000);
    }

    onModuleDestroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    async evaluateSchedules() {
        this.logger.log('Evaluating recording schedules for all cameras...');
        try {
            const cameras = await this.camerasService.getAllCameras();
            for (const camera of cameras) {
                const mode = await this.camerasService.getCurrentRecordingMode(camera.id);

                // Logic to apply mode based on current state
                await this.applyRecordingMode(camera.id, mode, camera.isRecording);
            }
        } catch (err) {
            this.logger.error(`Error during schedule evaluation: ${err.message}`);
        }
    }

    private async applyRecordingMode(cameraId: string, mode: RecordingMode, currentlyRecording: boolean) {
        switch (mode) {
            case RecordingMode.ALWAYS:
                if (!currentlyRecording) {
                    this.logger.log(`Schedule: Starting ALWAYS recording for camera ${cameraId}`);
                    await this.camerasService.startRecording(cameraId, 'system');
                }
                break;

            case RecordingMode.DO_NOT_RECORD:
                if (currentlyRecording) {
                    this.logger.log(`Schedule: Stopping recording for camera ${cameraId} (DO_NOT_RECORD block)`);
                    await this.camerasService.stopRecording(cameraId, 'system');
                }
                break;

            case RecordingMode.MOTION_ONLY:
            case RecordingMode.MOTION_LOW_RES:
                // For now, if we are in motion-only mode and recording is ON, 
                // we might want to stop it until an event triggers it.
                // However, the current system is simplified. 
                // We'll mark it as "Stop" normally, and EventRules will handle the rest.
                if (currentlyRecording) {
                    this.logger.log(`Schedule: Stopping continuous recording for camera ${cameraId} (entering MOTION mode)`);
                    await this.camerasService.stopRecording(cameraId, 'system');
                }
                break;
        }
    }
}

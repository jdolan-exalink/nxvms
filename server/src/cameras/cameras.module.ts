import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CameraEntity, StreamEntity, RecordingSegmentEntity, DirectoryServerEntity, RecordingScheduleEntity, StorageLocationEntity } from '@/database/entities';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { RecordingEngineService } from './recording-engine.service';
import { RecordingManagerService } from './recording-manager.service';
import { FFmpegService, OnvifService, StorageService } from '@/shared/services';
import { FrigateModule } from '@/integrations/frigate/frigate.module';

import { StatusMonitorService } from './status-monitor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CameraEntity, StreamEntity, RecordingSegmentEntity, DirectoryServerEntity, RecordingScheduleEntity, StorageLocationEntity]),
    FrigateModule,
  ],
  controllers: [CamerasController],
  providers: [CamerasService, RecordingEngineService, RecordingManagerService, StatusMonitorService],
  exports: [CamerasService],
})
export class CamerasModule { }

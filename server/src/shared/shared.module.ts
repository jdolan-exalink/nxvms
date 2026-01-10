import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity, StorageLocationEntity, CameraEntity, RecordingSegmentEntity } from '../database/entities';
import { AuditService } from './services/audit.service';
import { FFmpegService } from './services/ffmpeg.service';
import { OnvifService } from './services/onvif.service';
import { StorageService } from './services/storage.service';
import { RetentionService } from './services/retention.service';
import { IntegrityService } from './services/integrity.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLogEntity,
      StorageLocationEntity,
      CameraEntity,
      RecordingSegmentEntity
    ]),
  ],
  providers: [
    AuditService,
    FFmpegService,
    OnvifService,
    StorageService,
    RetentionService,
    IntegrityService,
  ],
  exports: [
    AuditService,
    FFmpegService,
    OnvifService,
    StorageService,
    RetentionService,
    IntegrityService,
  ],
})
export class SharedModule { }

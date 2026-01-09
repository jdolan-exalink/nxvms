import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from '../database/entities/audit-log.entity';
import { AuditService } from './services/audit.service';
import { FFmpegService } from './services/ffmpeg.service';
import { OnvifService } from './services/onvif.service';
import { StorageService } from './services/storage.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity]),
  ],
  providers: [
    AuditService,
    FFmpegService,
    OnvifService,
    StorageService,
  ],
  exports: [
    AuditService,
    FFmpegService,
    OnvifService,
    StorageService,
  ],
})
export class SharedModule {}

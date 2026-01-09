import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CameraEntity, StreamEntity, RecordingSegmentEntity, DirectoryServerEntity } from '@/database/entities';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { FFmpegService, OnvifService, StorageService } from '@/shared/services';
import { FrigateModule } from '@/integrations/frigate/frigate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CameraEntity, StreamEntity, RecordingSegmentEntity, DirectoryServerEntity]),
    FrigateModule,
  ],
  controllers: [CamerasController],
  providers: [CamerasService],
  exports: [CamerasService],
})
export class CamerasModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CameraEntity, StreamEntity, RecordingSegmentEntity } from '@/database/entities';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { FFmpegService, OnvifService, StorageService } from '@/shared/services';

@Module({
  imports: [TypeOrmModule.forFeature([CameraEntity, StreamEntity, RecordingSegmentEntity])],
  controllers: [CamerasController],
  providers: [CamerasService, FFmpegService, OnvifService, StorageService],
  exports: [CamerasService],
})
export class CamerasModule {}

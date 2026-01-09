import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordingSegmentEntity, VideoExportEntity, CameraEntity, StreamEntity, DirectoryServerEntity } from '@/database/entities';
import { FFmpegService } from '@/shared/services';
import { PlaybackService } from './playback.service';
import { PlaybackController } from './playback.controller';
import { FrigateModule } from '@/integrations/frigate/frigate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordingSegmentEntity, VideoExportEntity, CameraEntity, StreamEntity, DirectoryServerEntity]),
    FrigateModule,
  ],
  providers: [PlaybackService, FFmpegService],
  controllers: [PlaybackController],
  exports: [PlaybackService],
})
export class PlaybackModule {}

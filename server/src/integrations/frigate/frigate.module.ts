import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryServerEntity, DetectionEventEntity, CameraEntity, BookmarkEntity } from '@/database/entities';
import { FrigateService } from './frigate.service';
import { FrigateController } from './frigate.controller';
import { EventsModule } from '@/events/events.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([DirectoryServerEntity, DetectionEventEntity, CameraEntity, BookmarkEntity]),
    EventsModule,
  ],
  providers: [FrigateService],
  controllers: [FrigateController],
  exports: [FrigateService],
})
export class FrigateModule { }

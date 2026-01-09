import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { DetectionEventEntity } from '../database/entities/detection-event.entity';
import { CameraEntity } from '../database/entities/camera.entity';
import { EventsController } from './events.controller';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetectionEventEntity, CameraEntity]),
    RulesModule,
  ],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}

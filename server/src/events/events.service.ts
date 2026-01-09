import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetectionEventEntity } from '../database/entities/detection-event.entity';
import { CameraEntity } from '../database/entities/camera.entity';
import { RulesService } from '../rules/rules.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(DetectionEventEntity)
    private eventRepository: Repository<DetectionEventEntity>,
    @InjectRepository(CameraEntity)
    private cameraRepository: Repository<CameraEntity>,
    private rulesService: RulesService,
  ) {}

  @OnEvent('frigate.event')
  async handleFrigateEvent(payload: any) {
    const { before, after, type, serverId } = payload;
    const eventId = after.id;

    this.logger.debug(`Processing event ${type} for ${after.camera} on server ${serverId}: ${eventId}`);

    // Find camera in our DB using name AND serverId for precision
    const camera = await this.cameraRepository.findOne({
      where: { 
        frigateCameraName: after.camera,
        serverId: serverId
      }
    });

    let event = await this.eventRepository.findOne({ where: { externalId: eventId } });

    if (!event) {
      event = this.eventRepository.create({
        externalId: eventId,
        type: after.label,
        cameraName: after.camera,
        serverId: serverId || camera?.serverId,
        camera: camera,
        startTime: new Date(after.start_time * 1000),
      });
    }

    // Update with latest data
    event.score = after.top_score;
    event.box = after.box;
    event.hasClip = after.has_clip;
    event.hasSnapshot = after.has_snapshot;
    
    if (type === 'end') {
      event.endTime = new Date(after.end_time * 1000);
    }

    await this.eventRepository.save(event);

    if (type === 'new' || (type === 'update' && !before.person && after.person)) {
      this.checkRules(event);
    }
  }

  private checkRules(event: DetectionEventEntity) {
    this.rulesService.evaluate(event).catch(err => {
      this.logger.error(`Failed to evaluate rules for event ${event.id}: ${err.message}`);
    });
  }

  async findAll(query: any) {
    const { type, camera, limit = 50, offset = 0 } = query;
    const [items, total] = await this.eventRepository.findAndCount({
      where: {
        ...(type && { type }),
        ...(camera && { cameraName: camera }),
      },
      order: { startTime: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['camera'],
    });

    return {
      items: items.map(event => ({
        id: event.id,
        type: event.type,
        severity: event.score && event.score > 0.8 ? 'critical' : 'info',
        title: `${event.type.toUpperCase()} Detected`,
        message: `${event.type.toUpperCase()} detected on camera ${event.cameraName} with ${Math.round((event.score || 0) * 100)}% confidence`,
        timestamp: event.startTime.toISOString(),
        startTime: event.startTime.toISOString(),
        endTime: event.endTime?.toISOString(),
        cameraId: event.camera?.id,
        cameraName: event.cameraName,
        serverId: event.serverId,
        acknowledged: false,
        confidence: event.score,
        metadata: {
          externalId: event.externalId,
          box: event.box,
          hasClip: event.hasClip,
          hasSnapshot: event.hasSnapshot,
        }
      })),
      total,
      limit,
      offset
    };
  }
}

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
  ) { }

  @OnEvent('ai.event.normalized')
  async handleNormalizedAiEvent(eventData: any) {
    this.logger.log(`[AI HUB] Received ${eventData.engine} event: ${eventData.type} (${eventData.category})`);

    let camera = null;
    if (eventData.cameraId) {
      camera = await this.cameraRepository.findOneBy({ id: eventData.cameraId });
    } else if (eventData.cameraName) {
      camera = await this.cameraRepository.findOneBy({ name: eventData.cameraName });
    }

    const event = this.eventRepository.create({
      engine: eventData.engine || 'generic',
      category: eventData.category || 'object_detection',
      severity: eventData.severity || 'info',
      type: eventData.type,
      externalId: eventData.externalId,
      score: eventData.score,
      box: eventData.box,
      attributes: eventData.attributes || {},
      cameraName: camera?.name || eventData.cameraName,
      serverId: camera?.serverId || eventData.serverId,
      camera: camera,
      startTime: eventData.startTime || new Date(),
      endTime: eventData.endTime,
      hasClip: eventData.hasClip || false,
      hasSnapshot: eventData.hasSnapshot || false,
    });

    const savedEvent = await this.eventRepository.save(event);
    this.checkRules(savedEvent);
    return savedEvent;
  }



  private checkRules(event: DetectionEventEntity) {
    this.rulesService.evaluate(event).catch(err => {
      this.logger.error(`Failed to evaluate rules for event ${event.id}: ${err.message}`);
    });
  }

  async findAll(query: any) {
    const { type, camera, category, severity, engine, limit = 50, offset = 0 } = query;
    const [items, total] = await this.eventRepository.findAndCount({
      where: {
        ...(type && { type }),
        ...(camera && { cameraName: camera }),
        ...(category && { category }),
        ...(severity && { severity }),
        ...(engine && { engine }),
      },
      order: { startTime: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['camera'],
    });

    return {
      items: items.map(event => ({
        id: event.id,
        engine: event.engine,
        category: event.category,
        severity: event.severity,
        type: event.type,
        title: `${event.type.toUpperCase()} Detected`,
        message: this.formatEventMessage(event),
        timestamp: event.startTime.toISOString(),
        startTime: event.startTime.toISOString(),
        endTime: event.endTime?.toISOString(),
        cameraId: event.camera?.id,
        cameraName: event.cameraName,
        serverId: event.serverId,
        acknowledged: false,
        confidence: event.score,
        attributes: event.attributes,
        metadata: {
          externalId: event.externalId,
          box: event.box,
          hasClip: event.hasClip,
          hasSnapshot: event.hasSnapshot,
          snapshotPath: event.snapshotPath,
          clipPath: event.clipPath,
        }
      })),
      total,
      limit,
      offset
    };
  }

  private formatEventMessage(event: DetectionEventEntity): string {
    if (event.category === 'lpr') {
      return `License Plate DETECTED: [${event.attributes.plate}] on ${event.cameraName}`;
    }
    if (event.category === 'traffic' && event.attributes.speed) {
      return `Speed Violation: ${event.attributes.speed}km/h recorded on ${event.cameraName}`;
    }
    return `${event.type.toUpperCase()} detected on camera ${event.cameraName} (${Math.round((event.score || 0) * 100)}% confidence)`;
  }
}

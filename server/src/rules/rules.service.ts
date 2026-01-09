import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RuleEntity } from '../database/entities/rule.entity';
import { DetectionEventEntity } from '../database/entities/detection-event.entity';
import { AuditService } from '../shared/services/audit.service';
import { AuditAction } from '../database/entities/audit-log.entity';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);
  private readonly SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

  constructor(
    @InjectRepository(RuleEntity)
    private ruleRepository: Repository<RuleEntity>,
    private auditService: AuditService,
  ) {}

  async evaluate(event: DetectionEventEntity) {
    const rules = await this.ruleRepository.find({
      where: {
        enabled: true,
        eventType: event.type,
      }
    });

    for (const rule of rules) {
      if (rule.cameraName && rule.cameraName !== event.cameraName) {
        continue;
      }

      this.logger.log(`Executing rule "${rule.name}" for event ${event.id}`);
      await this.executeActions(rule, event);
    }
  }

  private async executeActions(rule: RuleEntity, event: DetectionEventEntity) {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'audit_log':
            await this.auditService.log(
              this.SYSTEM_USER_ID,
              AuditAction.RULE_TRIGGER,
              'Rule',
              rule.id,
              `Rule ${rule.name} triggered by ${event.type} on ${event.cameraName}`,
              { eventId: event.id, type: event.type, camera: event.cameraName }
            );
            break;
          
          case 'log':
            this.logger.log(`RULE ACTION LOG: Rule ${rule.name} triggered by ${event.type} on ${event.cameraName}`);
            break;
          
          default:
            this.logger.warn(`Unknown action type: ${action.type}`);
        }
      } catch (e) {
        this.logger.error(`Failed to execute action ${action.type} for rule ${rule.name}: ${e.message}`);
      }
    }
  }

  async create(data: any) {
    const rule = this.ruleRepository.create(data);
    return this.ruleRepository.save(rule);
  }

  async findAll() {
    return this.ruleRepository.find();
  }
}

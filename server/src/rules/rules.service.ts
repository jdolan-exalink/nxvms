import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RuleEntity, RuleScheduleEntity, LookupListEntity, AuditAction } from '../database/entities';
import { DetectionEventEntity } from '../database/entities/detection-event.entity';
import { AuditService } from '../shared/services/audit.service';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);
  private readonly SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

  constructor(
    @InjectRepository(RuleEntity)
    private ruleRepository: Repository<RuleEntity>,
    @InjectRepository(RuleScheduleEntity)
    private ruleScheduleRepository: Repository<RuleScheduleEntity>,
    @InjectRepository(LookupListEntity)
    private lookupListRepository: Repository<LookupListEntity>,
    private auditService: AuditService,
  ) { }

  async evaluate(event: DetectionEventEntity) {
    const rules = await this.ruleRepository.find({
      where: {
        enabled: true,
        eventType: event.type,
      },
      relations: ['schedules']
    });

    for (const rule of rules) {
      if (rule.cameraName && rule.cameraName !== event.cameraName) {
        continue;
      }

      // [Sector 10] Rule Scheduling
      if (!await this.isRuleInSchedule(rule)) {
        this.logger.debug(`Rule "${rule.name}" evaluation skipped due to schedule.`);
        continue;
      }

      // [Sector 10] Lookup Lists (If applicable)
      // Example: filter by plate if it's LPR
      if (!await this.matchesLookupFilters(rule, event)) {
        continue;
      }

      this.logger.log(`Executing rule "${rule.name}" for event ${event.id}`);
      await this.executeActions(rule, event);
    }
  }

  private async isRuleInSchedule(rule: RuleEntity): Promise<boolean> {
    if (!rule.schedules || rule.schedules.length === 0) {
      return true; // No schedule means always ON
    }

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    return rule.schedules.some(s => s.dayOfWeek === day && s.hour === hour && s.enabled);
  }

  private async matchesLookupFilters(rule: RuleEntity, event: DetectionEventEntity): Promise<boolean> {
    // In a real implementation, 'rule.metadata' would contain lookup list IDs
    // and 'event.metadata' would contain the detected value (e.g. license plate)
    return true; // Simplified for now
  }

  private processPlaceholders(text: string, event: DetectionEventEntity): string {
    if (!text) return '';
    return text
      .replace(/{camera_name}/g, event.cameraName || 'Unknown')
      .replace(/{event_type}/g, event.type || 'Unknown')
      .replace(/{time}/g, new Date().toLocaleString())
      .replace(/{id}/g, event.id.substring(0, 8));
  }

  private async executeActions(rule: RuleEntity, event: DetectionEventEntity) {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'audit_log':
            const description = this.processPlaceholders(
              action.template || `Rule {rule_name} triggered by {event_type} on {camera_name}`,
              event
            ).replace(/{rule_name}/g, rule.name);

            await this.auditService.log(
              this.SYSTEM_USER_ID,
              AuditAction.RULE_TRIGGER,
              'Rule',
              rule.id,
              description,
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

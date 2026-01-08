import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity, AuditAction } from '@/database/entities';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditRepository: Repository<AuditLogEntity>,
  ) {}

  async log(
    userId: string,
    action: AuditAction,
    resourceType?: string,
    resourceId?: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = this.auditRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      description,
      metadata,
      ipAddress,
      userAgent,
    });

    await this.auditRepository.save(auditLog);
  }

  async getLogs(
    userId?: string,
    action?: AuditAction,
    limit = 100,
    offset = 0,
  ): Promise<[AuditLogEntity[], number]> {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (userId) {
      query.where('audit.userId = :userId', { userId });
    }

    if (action) {
      query.where('audit.action = :action', { action });
    }

    query.orderBy('audit.createdAt', 'DESC').skip(offset).take(limit);

    return query.getManyAndCount();
  }
}

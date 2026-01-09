import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../shared/services/audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../database/entities/audit-log.entity';

@ApiTags('System - Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  async getLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    const [items, total] = await this.auditService.getLogs(userId, action, limit, offset);
    return {
      items,
      total,
      limit,
      offset,
    };
  }
}

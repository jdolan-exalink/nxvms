import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/events')
export class EventsController {
  constructor(private eventsService: EventsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all detection events' })
  async findAll(
    @Query('type') type?: string,
    @Query('camera') camera?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.eventsService.findAll({ type, camera, limit, offset });
    return { success: true, data: result };
  }
}

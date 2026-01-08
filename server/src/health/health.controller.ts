import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  async getHealth() {
    return this.healthService.getHealth();
  }

  @Get('db')
  @ApiOperation({ summary: 'Check database connection' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Get('ffmpeg')
  @ApiOperation({ summary: 'Check FFmpeg availability' })
  async checkFFmpeg() {
    return this.healthService.checkFFmpeg();
  }
}

import { Controller, Get, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoExportEntity } from '../database/entities/video-export.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('System - Exports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/exports')
export class ExportsController {
  constructor(
    @InjectRepository(VideoExportEntity)
    private exportRepository: Repository<VideoExportEntity>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all exports' })
  async findAll(@Query('cameraId') cameraId?: string) {
    return this.exportRepository.find({
      where: cameraId ? { cameraId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get export job by ID' })
  async findOne(@Param('id') id: string) {
    return this.exportRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete export job' })
  async remove(@Param('id') id: string) {
    await this.exportRepository.delete(id);
    return { success: true };
  }
}

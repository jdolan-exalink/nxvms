import { Controller, Get, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserEntity } from '@/database/entities';
import { PlaybackService } from './playback.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Playback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/playback')
export class PlaybackController {
  constructor(private playbackService: PlaybackService) {}

  @Get('stream/:cameraId')
  @ApiOperation({ summary: 'Get HLS stream for camera' })
  @ApiResponse({ status: 200, description: 'HLS playlist URL and status' })
  async getStream(@Param('cameraId') cameraId: string) {
    return this.playbackService.getHLSPlaylist(cameraId);
  }

  @Get('timeline/:cameraId')
  @ApiOperation({ summary: 'Get recording timeline with segments' })
  @ApiResponse({ status: 200, description: 'Array of recording segments' })
  async getTimeline(
    @Param('cameraId') cameraId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.playbackService.getTimeline(
      cameraId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('export')
  @ApiOperation({ summary: 'Create video export job' })
  @ApiResponse({ status: 201, description: 'Export job created' })
  async createExport(
    @Body() body: { cameraId: string; startTime: Date; endTime: Date; format: string },
    @CurrentUser() user: UserEntity,
  ) {
    return this.playbackService.createExport(body.cameraId, body.startTime, body.endTime, body.format, user.id);
  }

  @Get('export/:exportId')
  @ApiOperation({ summary: 'Get export job status' })
  @ApiResponse({ status: 200, description: 'Export job details' })
  async getExportStatus(@Param('exportId') exportId: string) {
    return this.playbackService.getExportStatus(exportId);
  }

  @Get('exports/:cameraId')
  @ApiOperation({ summary: 'List exports for camera' })
  @ApiResponse({ status: 200, description: 'Array of export jobs' })
  async listExports(
    @Param('cameraId') cameraId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.playbackService.listExports(cameraId, limit ? parseInt(limit) : 10, offset ? parseInt(offset) : 0);
  }

  @Delete('export/:exportId')
  @ApiOperation({ summary: 'Delete export job' })
  @ApiResponse({ status: 200, description: 'Export job deleted' })
  async deleteExport(
    @Param('exportId') exportId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<{ message: string }> {
    await this.playbackService.deleteExport(exportId, user.id);
    return { message: 'Export deleted successfully' };
  }
}

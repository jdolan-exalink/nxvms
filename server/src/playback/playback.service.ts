import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { RecordingSegmentEntity, VideoExportEntity, StreamEntity, CameraEntity, RecordingType } from '@/database/entities';
import { FFmpegService } from '@/shared/services';

export interface TimelineSegment {
  id: string;
  startTime: Date;
  endTime: Date;
  type: string;
  duration: number;
  hasMotion: boolean;
}

export interface TimelineResponse {
  segments: TimelineSegment[];
  total: number;
  cameraId: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class PlaybackService {
  constructor(
    @InjectRepository(RecordingSegmentEntity)
    private recordingRepository: Repository<RecordingSegmentEntity>,
    @InjectRepository(VideoExportEntity)
    private exportRepository: Repository<VideoExportEntity>,
    @InjectRepository(StreamEntity)
    private streamRepository: Repository<StreamEntity>,
    @InjectRepository(CameraEntity)
    private cameraRepository: Repository<CameraEntity>,
    private ffmpegService: FFmpegService,
  ) {}

  /**
   * Get HLS playlist for a camera stream
   */
  async getHLSPlaylist(cameraId: string): Promise<{ playlistUrl: string; status: string }> {
    const camera = await this.cameraRepository.findOne({ where: { id: cameraId } });

    if (!camera) {
      throw new NotFoundException('Camera not found');
    }

    if (camera.status !== 'online') {
      throw new BadRequestException(`Camera is ${camera.status}, cannot stream`);
    }

    // Return HLS playlist path
    return {
      playlistUrl: `/hls/${cameraId}/stream.m3u8`,
      status: 'ready',
    };
  }

  /**
   * Get recording timeline for a camera (recordings broken into segments)
   */
  async getTimeline(
    cameraId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimelineResponse> {
    const camera = await this.cameraRepository.findOne({ where: { id: cameraId } });

    if (!camera) {
      throw new NotFoundException('Camera not found');
    }

    // Get streams for this camera
    const streams = await this.streamRepository.find({
      where: { camera: { id: cameraId } },
    });

    if (streams.length === 0) {
      return {
        segments: [],
        total: 0,
        cameraId,
        startDate,
        endDate,
      };
    }

    // Build query for segments
    const query = this.recordingRepository
      .createQueryBuilder('segment')
      .where('segment.stream_id IN (:...streamIds)', { streamIds: streams.map((s) => s.id) });

    // Add date filters if provided
    if (startDate) {
      query.andWhere('segment.start_time >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('segment.end_time <= :endDate', { endDate });
    }

    const segments = await query
      .orderBy('segment.start_time', 'ASC')
      .getMany();

    return {
      segments: segments.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        type: s.type,
        duration: s.duration,
        hasMotion: s.type === RecordingType.MOTION,
      })),
      total: segments.length,
      cameraId,
      startDate,
      endDate,
    };
  }

  /**
   * Create an export job for a camera recording segment
   */
  async createExport(
    cameraId: string,
    startTime: Date,
    endTime: Date,
    format: string,
    userId: string,
  ): Promise<VideoExportEntity> {
    // Validate format
    const validFormats = ['mp4', 'avi', 'mkv'];
    if (!validFormats.includes(format)) {
      throw new BadRequestException(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
    }

    // Validate camera exists
    const camera = await this.cameraRepository.findOne({ where: { id: cameraId } });
    if (!camera) {
      throw new NotFoundException('Camera not found');
    }

    // Validate time range
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Create export job
    const exportJob = this.exportRepository.create({
      cameraId,
      startTime,
      endTime,
      format,
      status: 'pending',
      createdById: userId,
      filePath: null,
    });

    const saved = await this.exportRepository.save(exportJob);

    // In real implementation, would trigger background job here
    // For now, mark as completed
    saved.status = 'completed';
    saved.updatedAt = new Date();
    await this.exportRepository.save(saved);

    return saved;
  }

  /**
   * Get status of an export job
   */
  async getExportStatus(exportId: string): Promise<VideoExportEntity> {
    const videoExport = await this.exportRepository.findOne({ where: { id: exportId } });

    if (!videoExport) {
      throw new NotFoundException('Export not found');
    }

    return videoExport;
  }

  /**
   * List all exports for a camera
   */
  async listExports(
    cameraId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ exports: VideoExportEntity[]; total: number }> {
    const [exports, total] = await this.exportRepository.findAndCount({
      where: { cameraId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { exports, total };
  }

  /**
   * Delete an export job
   */
  async deleteExport(exportId: string, userId: string): Promise<void> {
    const videoExport = await this.exportRepository.findOne({ where: { id: exportId } });

    if (!videoExport) {
      throw new NotFoundException('Export not found');
    }

    await this.exportRepository.delete(exportId);
  }
}

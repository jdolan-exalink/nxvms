import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CameraEntity, CameraStatus } from '@/database/entities';
import * as os from 'os';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(CameraEntity)
    private cameraRepository: Repository<CameraEntity>,
    private dataSource: DataSource,
  ) {}

  async getHealth(): Promise<any> {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        system: {
          total: `${Math.round(totalMemory / 1024 / 1024 / 1024)}GB`,
          free: `${Math.round(freeMemory / 1024 / 1024 / 1024)}GB`,
        },
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      camera: {
        total: await this.cameraRepository.count(),
        online: await this.cameraRepository.count({ where: { status: CameraStatus.ONLINE } }),
      },
    };
  }

  async checkDatabase(): Promise<{ status: string; message?: string; responseTime?: string }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - start;
      return {
        status: 'OK',
        responseTime: `${responseTime}ms`,
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: error.message,
      };
    }
  }

  async checkFFmpeg(): Promise<{ status: string; message?: string }> {
    // TODO: Check FFmpeg availability
    return {
      status: 'OK',
    };
  }
}

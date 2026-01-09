import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CameraEntity, CameraStatus } from '@/database/entities';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

@Injectable()
export class HealthService {
  private version: string;

  constructor(
    @InjectRepository(CameraEntity)
    private cameraRepository: Repository<CameraEntity>,
    private dataSource: DataSource,
  ) {
    this.version = this.loadVersion();
  }

  private loadVersion(): string {
    try {
      // Try to read from package.json
      const pkgPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        return pkg.version || '0.1.0';
      }
    } catch (e) {
      // ignore
    }
    return '0.1.0';
  }

  async getHealth(): Promise<any> {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    return {
      status: 'UP',
      version: this.version,
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
      ffmpeg: await this.checkFFmpeg(),
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

  async checkFFmpeg(): Promise<{ status: string; version?: string; message?: string }> {
    try {
      const output = execSync('ffmpeg -version').toString();
      const versionMatch = output.match(/ffmpeg version (.*?) /);
      return {
        status: 'OK',
        version: versionMatch ? versionMatch[1] : 'Unknown',
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'FFmpeg not found in system path',
      };
    }
  }
}

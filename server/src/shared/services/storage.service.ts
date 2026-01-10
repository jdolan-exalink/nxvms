import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { StorageLocationEntity, RwPolicy, RecordingSegmentEntity, StorageRole } from '@/database/entities';
import * as disk from 'node-disk-info';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(StorageLocationEntity)
    private locationRepository: Repository<StorageLocationEntity>,
    @InjectRepository(RecordingSegmentEntity)
    private segmentRepository: Repository<RecordingSegmentEntity>,
  ) { }

  async onModuleInit() {
    await this.ensureDirectories();
    // Start disk watchdog every 1 minute for enterprise stability
    setInterval(() => this.checkAllLocations(), 60000);
  }

  async ensureDirectories(): Promise<void> {
    const dirs = [
      this.configService.get<string>('STORAGE_PATH', './storage'),
      this.configService.get<string>('HLS_PATH', './hls'),
      this.configService.get<string>('SNAPSHOT_PATH', './storage/snapshots'),
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        this.logger.log(`Directory ensured: ${dir}`);
      } catch (error) {
        this.logger.error(`Failed to create directory ${dir}: ${error.message}`);
      }
    }
  }

  /**
   * Generates a date-based storage path: year/month/day/hour
   * Pattern: {base}/cameraId/YYYY/MM/DD/HH/
   */
  getDateBasedPath(basePath: string, cameraId: string, date: Date = new Date()): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');

    return path.join(basePath, cameraId, year, month, day, hour);
  }

  async getBestStoragePath(cameraId: string, serverId: string): Promise<string> {
    const locations = await this.locationRepository.find({
      where: { serverId, rwPolicy: RwPolicy.READ_WRITE, enabled: true, status: 'online' as any }
    });

    if (locations.length === 0) {
      // Fallback to default system path if no extra disks are configured
      const defaultPath = this.configService.get<string>('STORAGE_PATH', './storage');
      return this.getDateBasedPath(defaultPath, cameraId);
    }

    // [Nx Rule] Stability Guard: Prefer non-system drives if they exist
    const nonSystemDrives = locations.filter(l => !l.path.startsWith('/var/lib') && !l.path.startsWith('C:\\Users'));
    const candidates = nonSystemDrives.length > 0 ? nonSystemDrives : locations;

    // [Nx Rule] Balanced writing: Select drive with most relative free space
    let bestLocation = null;
    let maxAvailable = -1;

    for (const loc of candidates) {
      try {
        const stats = await this.getDiskStats(loc.path);
        const reserved = loc.reservedBytes ? BigInt(loc.reservedBytes) : (BigInt(stats.total) * BigInt(loc.reservedPct)) / 100n;
        const available = BigInt(stats.free) - reserved;

        if (Number(available) > maxAvailable) {
          maxAvailable = Number(available);
          bestLocation = loc;
        }
      } catch (err) {
        this.logger.error(`Disk check failed for ${loc.path}: ${err.message}`);
      }
    }

    if (!bestLocation) {
      return this.getDateBasedPath(this.configService.get<string>('STORAGE_PATH', './storage'), cameraId);
    }

    return this.getDateBasedPath(bestLocation.path, cameraId);
  }

  async checkAllLocations(): Promise<void> {
    this.logger.log('Disk Watchdog: Running enterprise storage health check...');
    const locations = await this.locationRepository.find();

    for (const loc of locations) {
      try {
        const stats = await this.getDiskStats(loc.path);
        const reserved = loc.reservedBytes ? BigInt(loc.reservedBytes) : (BigInt(stats.total) * BigInt(loc.reservedPct)) / 100n;

        // Update capacity if unknown
        if (!loc.capacity || loc.capacity != Number(stats.total)) {
          await this.locationRepository.update(loc.id, { capacity: Number(stats.total) });
        }

        // [Archiving Strategy] Recycle if below reserved threshold
        if (BigInt(stats.free) <= reserved) {
          this.logger.warn(`Storage ${loc.path} reached reserved threshold. Initiating recycling...`);
          await this.recycleStorage(loc);
        }

        if (loc.status !== 'online') {
          await this.locationRepository.update(loc.id, { status: 'online' });
        }
      } catch (err) {
        this.logger.error(`Health check failed for location ${loc.path}: ${err.message}`);
        await this.locationRepository.update(loc.id, { status: 'error' });
      }
    }
  }

  /**
   * [Enterprise Recycling] "Oldest first" deletion
   * Deletes recording segments until enough space is cleared
   */
  private async recycleStorage(location: StorageLocationEntity): Promise<void> {
    // Find oldest 50 segments for cameras recorded in this location
    // Note: We filter by path prefix to find segments living on this specific disk
    const oldSegments = await this.segmentRepository.find({
      where: { filePath: Like(`${location.path}%`) },
      order: { startTime: 'ASC' },
      take: 50
    });

    if (oldSegments.length === 0) {
      this.logger.error(`Recycling: No segments found to delete in ${location.path}, but space is low!`);
      return;
    }

    for (const segment of oldSegments) {
      try {
        await fs.unlink(segment.filePath);
        // Also try to delete thumbnail if exists
        if (segment.thumbnailPath) await fs.unlink(segment.thumbnailPath).catch(() => { });

        await this.segmentRepository.delete(segment.id);
        this.logger.log(`Recycled: Deleted oldest segment ${segment.id} from ${location.path}`);

        // Re-check space after every X deletions or just finish this batch
      } catch (err) {
        this.logger.error(`Failed to delete segment file ${segment.filePath}: ${err.message}`);
        // If file doesn't exist, still remove from DB to keep index clean
        await this.segmentRepository.delete(segment.id);
      }
    }
  }

  async getDiskStats(dirPath: string): Promise<{ free: number; total: number }> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      const stats = await (fs as any).statfs(dirPath);
      return {
        free: Number(BigInt(stats.bfree) * BigInt(stats.bsize)),
        total: Number(BigInt(stats.blocks) * BigInt(stats.bsize))
      };
    } catch (e) {
      throw new Error(`Disk IO Error on ${dirPath}: ${e.message}`);
    }
  }

  async saveSnapshot(cameraId: string, data: Buffer, reason: string = 'event'): Promise<string> {
    const base = this.configService.get<string>('SNAPSHOT_PATH', './storage/snapshots');
    const filename = `${cameraId}_${Date.now()}_${reason}.jpg`;
    const fullPath = path.join(base, filename);
    await fs.writeFile(fullPath, data);
    return fullPath;
  }

  getCameraStoragePath(cameraId: string): string {
    const base = this.configService.get<string>('STORAGE_PATH', './storage');
    return path.join(base, cameraId);
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      this.logger.log(`Directory deleted: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Failed to delete directory ${dirPath}: ${error.message}`);
    }
  }

  async getDrives(): Promise<any[]> {
    let mappedDrives: any[] = [];

    // 1. Try standard disk info
    try {
      const drives = await disk.getDiskInfo();
      mappedDrives = drives.map(d => ({
        name: d.mounted,
        description: `${d.filesystem} - ${this.formatBytes(d.blocks * 1024)} total`,
        total: d.blocks * 1024,
        free: d.available * 1024,
        used: d.used * 1024,
        mountPoint: d.mounted
      }));
    } catch (e) {
      this.logger.warn(`Native disk info check failed: ${e.message}`);
    }

    // 2. [Docker/Linux Support] Scan /mnt for manual mounts (Docker volumes)
    if (process.platform === 'linux') {
      const extraMounts = ['/mnt'];

      for (const mount of extraMounts) {
        try {
          // Check if mount exists first
          await fs.access(mount).catch(() => { throw new Error('No access'); });

          const items = await fs.readdir(mount, { withFileTypes: true });

          for (const item of items) {
            if (item.isDirectory()) {
              const fullPath = path.join(mount, item.name);

              // Avoid duplicates
              if (!mappedDrives.find(d => d.mountPoint === fullPath)) {
                try {
                  const stats = await this.getDiskStats(fullPath);
                  mappedDrives.push({
                    name: item.name, // Display just folder name (e.g. "cctv")
                    description: `Montaje Local - ${this.formatBytes(stats.total)}`,
                    total: stats.total,
                    free: stats.free,
                    used: stats.total - stats.free,
                    mountPoint: fullPath
                  });
                } catch (statErr) {
                  this.logger.warn(`Skipping invalid mount ${fullPath}: ${statErr.message}`);
                }
              }
            }
          }
        } catch (e) {
          // /mnt might not exist or be accessible, ignore
        }
      }

      // Ensure Root exists if nothing else found
      if (!mappedDrives.find(d => d.mountPoint === '/')) {
        mappedDrives.unshift({
          name: 'Root',
          description: 'System Root',
          total: 0,
          free: 0,
          used: 0,
          mountPoint: '/'
        });
      }

      this.logger.log(`Detected Docker/Linux mounts: ${mappedDrives.map(d => `${d.name} (${d.mountPoint})`).join(', ')}`);
    }

    return mappedDrives;
  }

  async exploreDirectory(dirPath: string): Promise<any[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      // Map entries and filter to keep directories only (or you can include files if needed)
      // User asked for "folder creation", implies browsing folders.
      const dirs = entries
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
          name: dirent.name,
          path: path.join(dirPath, dirent.name),
          type: 'directory'
        }));

      return dirs;
    } catch (e) {
      this.logger.error(`Failed to explore ${dirPath}: ${e.message}`);
      throw new Error(`Could not read directory: ${e.message}`);
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (e) {
      throw new Error(`Failed to create directory: ${e.message}`);
    }
  }

  private formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

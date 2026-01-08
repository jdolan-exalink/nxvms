import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {}

  async ensureDirectories(): Promise<void> {
    const dirs = [
      this.configService.get<string>('STORAGE_PATH', './storage'),
      this.configService.get<string>('CHUNKS_PATH', './chunks'),
      this.configService.get<string>('HLS_PATH', './hls'),
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

  getCameraStoragePath(cameraId: string): string {
    const basePath = this.configService.get<string>('STORAGE_PATH', './storage');
    return path.join(basePath, cameraId);
  }

  getHLSPlaylistPath(cameraId: string): string {
    const hlsPath = this.configService.get<string>('HLS_PATH', './hls');
    return path.join(hlsPath, cameraId, 'stream.m3u8');
  }

  getChunkPath(cameraId: string, chunkName: string): string {
    const chunksPath = this.configService.get<string>('CHUNKS_PATH', './chunks');
    return path.join(chunksPath, cameraId, chunkName);
  }

  async saveChunk(cameraId: string, chunkName: string, data: Buffer): Promise<string> {
    const chunkPath = this.getChunkPath(cameraId, chunkName);
    const dir = path.dirname(chunkPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(chunkPath, data);

    this.logger.debug(`Chunk saved: ${chunkPath}`);
    return chunkPath;
  }

  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      this.logger.error(`Error getting file size: ${error.message}`);
      return 0;
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      this.logger.log(`Directory deleted: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Error deleting directory: ${error.message}`);
    }
  }

  async listChunks(cameraId: string): Promise<string[]> {
    try {
      const dir = path.join(this.configService.get<string>('CHUNKS_PATH', './chunks'), cameraId);
      const files = await fs.readdir(dir);
      return files.filter((f) => f.endsWith('.ts'));
    } catch (error) {
      this.logger.warn(`Error listing chunks: ${error.message}`);
      return [];
    }
  }
}

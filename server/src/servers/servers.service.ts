import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectoryServerEntity, ServerType, ServerStatus, StorageLocationEntity } from '../database/entities';
import { StorageService } from '../shared/services/storage.service';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(DirectoryServerEntity)
    private serverRepository: Repository<DirectoryServerEntity>,
    @InjectRepository(StorageLocationEntity)
    private storageRepository: Repository<StorageLocationEntity>,
    private storageService: StorageService,
  ) { }

  async findAll() {
    return this.serverRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string) {
    const server = await this.serverRepository.findOneBy({ id });
    if (!server) throw new NotFoundException('Server not found');
    return server;
  }

  async create(data: Partial<DirectoryServerEntity>) {
    const server = this.serverRepository.create({
      ...data,
      status: ServerStatus.ONLINE,
    });
    return this.serverRepository.save(server);
  }

  async update(id: string, data: Partial<DirectoryServerEntity>) {
    const server = await this.findOne(id);
    Object.assign(server, data);
    return this.serverRepository.save(server);
  }

  async remove(id: string) {
    const server = await this.findOne(id);
    return this.serverRepository.remove(server);
  }

  async getLocalServer() {
    return this.serverRepository.findOneBy({ type: ServerType.NX_VM });
  }

  async getStorageLocations(serverId: string) {
    return this.storageRepository.find({
      where: { serverId },
      order: { createdAt: 'ASC' }
    });
  }

  async addStorageLocation(serverId: string, data: Partial<StorageLocationEntity>) {
    const server = await this.findOne(serverId);

    // Auto-create directory and fetch stats
    let capacity = 0;
    try {
      // getDiskStats automatically creates the directory if it doesn't exist
      const stats = await this.storageService.getDiskStats(data.path);
      capacity = stats.total;
    } catch (e) {
      console.warn(`Failed to init storage stats for ${data.path}: ${e.message}`);
    }

    const location = this.storageRepository.create({
      ...data,
      serverId: server.id,
      capacity, // Set real capacity
      status: capacity > 0 ? 'online' : 'error',
    });
    return this.storageRepository.save(location);
  }

  async updateStorageLocation(id: string, data: Partial<StorageLocationEntity>) {
    const location = await this.storageRepository.findOneBy({ id });
    if (!location) throw new NotFoundException('Storage location not found');
    Object.assign(location, data);
    return this.storageRepository.save(location);
  }

  async removeStorageLocation(id: string) {
    const location = await this.storageRepository.findOneBy({ id });
    if (!location) throw new NotFoundException('Storage location not found');
    return this.storageRepository.remove(location);
  }

  async getSystemDrives() {
    return this.storageService.getDrives();
  }

  async browsePath(path: string) {
    return this.storageService.exploreDirectory(path);
  }

  async createPath(path: string) {
    return this.storageService.createDirectory(path);
  }
}

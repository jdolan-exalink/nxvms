import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectoryServerEntity, ServerType, ServerStatus } from '../database/entities/directory-server.entity';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(DirectoryServerEntity)
    private serverRepository: Repository<DirectoryServerEntity>,
  ) {}

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
}

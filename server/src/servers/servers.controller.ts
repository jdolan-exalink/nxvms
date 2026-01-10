import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ServersService } from './servers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DirectoryServerEntity } from '../database/entities/directory-server.entity';

@Controller('api/v1/servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(private readonly serversService: ServersService) { }

  @Get()
  async findAll() {
    const servers = await this.serversService.findAll();
    return { success: true, data: servers };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const server = await this.serversService.findOne(id);
    return { success: true, data: server };
  }

  @Post()
  async create(@Body() data: Partial<DirectoryServerEntity>) {
    const server = await this.serversService.create(data);
    return { success: true, data: server };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<DirectoryServerEntity>) {
    const server = await this.serversService.update(id, data);
    return { success: true, data: server };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.serversService.remove(id);
    return { success: true };
  }

  @Post('test-url')
  async testUrl(@Body() data: { url: string }) {
    try {
      const axios = require('axios');
      const response = await axios.get(data.url, { timeout: 5000 });
      return { success: true, data: { status: 'online', statusCode: response.status } };
    } catch (error) {
      return { success: false, error: { message: 'Connection failed: ' + error.message } };
    }
  }

  @Post(':id/test')
  async testConnection(@Param('id') id: string) {
    // ... code omitted for brevity as it is unchanged ...
    try {
      const server = await this.serversService.findOne(id);
      const axios = require('axios');
      const response = await axios.get(server.url, { timeout: 5000 });
      return { success: true, data: { status: 'online', statusCode: response.status } };
    } catch (error) {
      return { success: false, error: { message: 'Connection failed: ' + error.message } };
    }
  }

  @Get(':id/storage')
  async getStorage(@Param('id') serverId: string) {
    const locations = await this.serversService.getStorageLocations(serverId);
    return { success: true, data: locations };
  }

  @Post(':id/storage')
  async addStorage(@Param('id') serverId: string, @Body() data: any) {
    const location = await this.serversService.addStorageLocation(serverId, data);
    return { success: true, data: location };
  }

  @Put('storage/:locationId')
  async updateStorage(@Param('locationId') locationId: string, @Body() data: any) {
    const location = await this.serversService.updateStorageLocation(locationId, data);
    return { success: true, data: location };
  }

  @Delete('storage/:locationId')
  async deleteStorage(@Param('locationId') locationId: string) {
    await this.serversService.removeStorageLocation(locationId);
    return { success: true };
  }
  @Get(':id/drives')
  async getDrives(@Param('id') id: string) {
    // In a real multi-server VMS, we would proxy this to the remote node.
    // For now, we assume local node operation or centralized storage management.
    // If id != 'local' && id != localServerId, we should proxy.
    const drives = await this.serversService.getSystemDrives();
    return { success: true, data: drives };
  }

  @Post(':id/browse')
  async browse(@Param('id') id: string, @Body() body: { path: string }) {
    const contents = await this.serversService.browsePath(body.path);
    return { success: true, data: contents };
  }

  @Post(':id/mkdir')
  async mkdir(@Param('id') id: string, @Body() body: { path: string }) {
    await this.serversService.createPath(body.path);
    return { success: true };
  }
}


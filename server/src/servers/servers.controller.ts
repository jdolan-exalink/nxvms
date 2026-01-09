import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServersService } from './servers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DirectoryServerEntity } from '../database/entities/directory-server.entity';

@Controller('api/v1/servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

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

  @Post(':id/test')
  async testConnection(@Param('id') id: string) {
    try {
      const server = await this.serversService.findOne(id);
      // Simple fetch test
      const axios = require('axios');
      const response = await axios.get(server.url, { timeout: 5000 });
      return { 
        success: true, 
        data: { 
          status: 'online', 
          statusCode: response.status 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: { 
          message: 'Connection failed: ' + error.message 
        } 
      };
    }
  }
}


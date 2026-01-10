import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { StorageService } from '@/shared/services/storage.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocationEntity, StorageRole } from '@/database/entities';

@ApiTags('System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/system/storage')
export class StorageController {
    constructor(
        private storageService: StorageService,
        @InjectRepository(StorageLocationEntity)
        private locationRepository: Repository<StorageLocationEntity>
    ) { }

    @Get('locations')
    @ApiOperation({ summary: 'List all storage locations for this server' })
    async getLocations(@Query('serverId') serverId: string) {
        const locations = await this.locationRepository.find({
            where: { serverId },
            order: { createdAt: 'ASC' }
        });
        return { success: true, data: locations };
    }

    @Post('locations')
    @ApiOperation({ summary: 'Add a new storage location' })
    async addLocation(@Body() dto: Partial<StorageLocationEntity>) {
        const location = this.locationRepository.create({
            ...dto,
            status: 'online',
            roles: dto.roles || [StorageRole.MAIN],
            reservedPct: dto.reservedPct || 10
        });

        // Validate path before saving
        await this.storageService.getDiskStats(location.path);

        const saved = await this.locationRepository.save(location);
        return { success: true, data: saved };
    }

    @Put('locations/:id')
    @ApiOperation({ summary: 'Update storage location settings' })
    async updateLocation(@Param('id') id: string, @Body() dto: Partial<StorageLocationEntity>) {
        await this.locationRepository.update(id, dto);
        const updated = await this.locationRepository.findOneBy({ id });
        return { success: true, data: updated };
    }

    @Delete('locations/:id')
    @ApiOperation({ summary: 'Remove a storage location' })
    async deleteLocation(@Param('id') id: string) {
        await this.locationRepository.delete(id);
        return { success: true };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get real-time disk stats for all locations' })
    async getGlobalStats(@Query('serverId') serverId: string) {
        const locations = await this.locationRepository.find({ where: { serverId } });
        const stats = [];

        for (const loc of locations) {
            try {
                const disk = await this.storageService.getDiskStats(loc.path);
                stats.push({
                    id: loc.id,
                    path: loc.path,
                    ...disk,
                    reserved: loc.reservedBytes || (disk.total * loc.reservedPct) / 100,
                    status: loc.status
                });
            } catch (err) {
                stats.push({ id: loc.id, path: loc.path, status: 'error', error: err.message });
            }
        }

        return { success: true, data: stats };
    }
}

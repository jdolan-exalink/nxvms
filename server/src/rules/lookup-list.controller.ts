import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LookupListEntity } from '../database/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Lookup Lists')
@Controller('api/v1/lookup-lists')
@UseGuards(JwtAuthGuard)
export class LookupListController {
    constructor(
        @InjectRepository(LookupListEntity)
        private lookupRepository: Repository<LookupListEntity>,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all lookup lists' })
    async findAll() {
        const lists = await this.lookupRepository.find();
        return { success: true, data: lists };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific lookup list' })
    async findOne(@Param('id') id: string) {
        const list = await this.lookupRepository.findOneBy({ id });
        return { success: true, data: list };
    }

    @Post()
    @ApiOperation({ summary: 'Create a new lookup list' })
    async create(@Body() data: Partial<LookupListEntity>) {
        const list = this.lookupRepository.create(data);
        const saved = await this.lookupRepository.save(list);
        return { success: true, data: saved };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a lookup list' })
    async update(@Param('id') id: string, @Body() data: Partial<LookupListEntity>) {
        await this.lookupRepository.update(id, data);
        const updated = await this.lookupRepository.findOneBy({ id });
        return { success: true, data: updated };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a lookup list' })
    async remove(@Param('id') id: string) {
        await this.lookupRepository.delete(id);
        return { success: true };
    }
}

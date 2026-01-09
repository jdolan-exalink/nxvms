import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../database/entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('System - Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/roles')
export class RolesController {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  async findAll() {
    return this.roleRepository.find();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOne(@Param('id') id: string) {
    return this.roleRepository.findOne({ where: { id } });
  }
}

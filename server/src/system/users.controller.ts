import { Controller, Get, Param, Delete, Put, Body, UseGuards, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('System - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll() {
    return this.userRepository.find({
      relations: ['role'],
      select: ['id', 'username', 'email', 'displayName', 'isActive', 'lastLogin', 'createdAt'],
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role'],
      select: ['id', 'username', 'email', 'displayName', 'isActive', 'lastLogin', 'createdAt'],
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      await this.userRepository.remove(user);
    }
    return { success: true };
  }
}

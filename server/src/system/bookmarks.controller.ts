import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkEntity } from '../database/entities/bookmark.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../database/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/bookmarks')
export class BookmarksController {
  constructor(
    @InjectRepository(BookmarkEntity)
    private bookmarkRepository: Repository<BookmarkEntity>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create bookmark' })
  async create(@Body() data: any, @CurrentUser() user: UserEntity) {
    const bookmark = this.bookmarkRepository.create({
      ...data,
      createdById: user.id,
    });
    return this.bookmarkRepository.save(bookmark);
  }

  @Get()
  @ApiOperation({ summary: 'List bookmarks' })
  async findAll(@Query('cameraId') cameraId?: string) {
    return this.bookmarkRepository.find({
      where: cameraId ? { cameraId } : {},
      relations: ['camera', 'createdBy'],
      order: { startTime: 'DESC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bookmark by ID' })
  async findOne(@Param('id') id: string) {
    return this.bookmarkRepository.findOne({
      where: { id },
      relations: ['camera', 'createdBy'],
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bookmark' })
  async remove(@Param('id') id: string) {
    await this.bookmarkRepository.delete(id);
    return { success: true };
  }
}

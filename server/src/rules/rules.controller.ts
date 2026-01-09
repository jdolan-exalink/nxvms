import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rules')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rules' })
  async findAll() {
    return this.rulesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new rule' })
  async create(@Body() data: any) {
    return this.rulesService.create(data);
  }
}

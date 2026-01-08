import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserEntity } from '@/database/entities';
import { CamerasService } from './cameras.service';
import { CreateCameraDto, UpdateCameraDto } from './dto/camera.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cameras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/cameras')
export class CamerasController {
  constructor(private camerasService: CamerasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new camera' })
  @ApiResponse({ status: 201, description: 'Camera created' })
  async createCamera(
    @Body() createCameraDto: CreateCameraDto,
    @CurrentUser() user: UserEntity,
  ) {
    // TODO: Extract serverId from context
    return this.camerasService.createCamera(createCameraDto, user.id, 'server-1');
  }

  @Get()
  @ApiOperation({ summary: 'List all cameras' })
  @ApiResponse({ status: 200, description: 'List of cameras' })
  async getCameras() {
    return this.camerasService.getAllCameras('server-1');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get camera by ID' })
  async getCamera(@Param('id') cameraId: string) {
    return this.camerasService.getCameraById(cameraId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update camera' })
  async updateCamera(
    @Param('id') cameraId: string,
    @Body() updateCameraDto: UpdateCameraDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.camerasService.updateCamera(cameraId, updateCameraDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete camera' })
  async deleteCamera(@Param('id') cameraId: string, @CurrentUser() user: UserEntity) {
    await this.camerasService.deleteCamera(cameraId, user.id);
    return { success: true };
  }

  @Post(':id/recording/start')
  @ApiOperation({ summary: 'Start recording' })
  async startRecording(@Param('id') cameraId: string, @CurrentUser() user: UserEntity) {
    await this.camerasService.startRecording(cameraId, user.id);
    return { success: true };
  }

  @Post(':id/recording/stop')
  @ApiOperation({ summary: 'Stop recording' })
  async stopRecording(@Param('id') cameraId: string, @CurrentUser() user: UserEntity) {
    await this.camerasService.stopRecording(cameraId, user.id);
    return { success: true };
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover cameras via ONVIF' })
  async discoverCameras() {
    return this.camerasService.discoverCameras();
  }
}

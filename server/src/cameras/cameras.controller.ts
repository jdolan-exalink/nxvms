import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserEntity } from '@/database/entities';
import { CamerasService } from './cameras.service';
import { CreateCameraDto, UpdateCameraDto } from './dto/camera.dto';
import { UpdateRecordingScheduleDto, CopyScheduleDto } from './dto/recording-schedule.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cameras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/cameras')
export class CamerasController {
  private readonly logger = new Logger(CamerasController.name);

  constructor(private camerasService: CamerasService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new camera' })
  @ApiResponse({ status: 201, description: 'Camera created' })
  async createCamera(
    @Body() createCameraDto: CreateCameraDto,
    @CurrentUser() user: UserEntity,
  ) {
    const camera = await this.camerasService.createCamera(createCameraDto, user.id, createCameraDto.serverId);
    return { success: true, data: camera };
  }

  @Post('import/frigate/:serverId')
  @ApiOperation({ summary: 'Import cameras from a Frigate server' })
  async importFrigate(
    @Param('serverId') serverId: string,
    @CurrentUser() user: UserEntity,
  ) {
    this.logger.log(`Received import request for server: ${serverId} from user: ${user.id}`);
    const cameras = await this.camerasService.importFromFrigate(serverId, user.id);
    this.logger.log(`Import completed. Total cameras: ${cameras.length}`);
    return { success: true, data: cameras };
  }

  @Post('connect-onvif')
  @ApiOperation({ summary: 'Connect and add an ONVIF camera' })
  async connectOnvif(
    @Body() dto: { address: string; username?: string; password?: string; serverId?: string },
    @CurrentUser() user: UserEntity,
  ) {
    const camera = await this.camerasService.connectOnvif(dto, user.id);
    return { success: true, data: camera };
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover ONVIF cameras on the network' })
  async discoverCameras(@Query('serverId') serverId?: string) {
    // We pass serverId to use its IP as a discovery hint
    const cameras = await this.camerasService.discoverCameras(serverId);
    return { success: true, data: cameras };
  }

  @Get()
  @ApiOperation({ summary: 'List all cameras' })
  @ApiResponse({ status: 200, description: 'List of cameras' })
  async getCameras(@Query('serverId') serverId?: string) {
    const cameras = await this.camerasService.getAllCameras(serverId);
    return { success: true, data: cameras };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get resource tree for the client' })
  async getResourceTree(@CurrentUser() user: UserEntity) {
    try {
      await this.camerasService.syncAllStatuses(user.id);
    } catch (err) {
      this.logger.error(`Status sync failed during tree fetch: ${err.message}`);
    }

    const servers = await this.camerasService.getAllServers();
    const cameras = await this.camerasService.getAllCameras();

    // Group cameras by serverId
    const serversWithCameras = servers.map(server => {
      let host = 'localhost';
      let port = 80;
      try {
        const url = new URL(server.url.includes('://') ? server.url : `http://${server.url}`);
        host = url.hostname;
        port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
      } catch (e) {
        console.error(`Invalid server URL: ${server.url}`);
      }

      return {
        id: server.id,
        name: server.name,
        host,
        port,
        status: server.status === 'online' ? 'online' : 'offline',
        capabilities: [server.type === 'frigate' ? 'frigate' : 'generic', 'onvif', 'rtsp'],
        cameras: cameras
          .filter(cam => cam.serverId === server.id)
          .map(cam => ({
            ...cam,
            __typename: 'Camera',
            status: cam.status.toLowerCase(),
          })),
      };
    });

    // Add cameras without serverId to the first server or a "Default" one
    const orphanedCameras = cameras
      .filter(cam => !cam.serverId)
      .map(cam => ({
        ...cam,
        __typename: 'Camera',
        status: cam.status.toLowerCase(),
      }));

    if (orphanedCameras.length > 0 && serversWithCameras.length > 0) {
      serversWithCameras[0].cameras.push(...orphanedCameras);
    }

    return {
      success: true,
      data: {
        sites: [
          {
            id: 'site-1',
            name: 'Main Site',
            description: 'Your security infrastructure',
            servers: serversWithCameras,
            groups: []
          }
        ]
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get camera by ID' })
  async getCamera(@Param('id') cameraId: string) {
    const camera = await this.camerasService.getCameraById(cameraId);
    return { success: true, data: camera };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update camera' })
  async updateCamera(
    @Param('id') cameraId: string,
    @Body() updateCameraDto: UpdateCameraDto,
    @CurrentUser() user: UserEntity,
  ) {
    console.log('[CamerasController] ========================================');
    console.log('[CamerasController] PUT /cameras/:id called');
    console.log('[CamerasController] Camera ID:', cameraId);
    console.log('[CamerasController] User:', user?.username || 'unknown');
    console.log('[CamerasController] DTO received:', JSON.stringify(updateCameraDto, null, 2));
    console.log('[CamerasController] ========================================');

    try {
      const camera = await this.camerasService.updateCamera(cameraId, updateCameraDto, user.id);
      console.log('[CamerasController] ✅ Update successful');
      return { success: true, data: camera };
    } catch (error) {
      console.error('[CamerasController] ❌ Update failed');
      console.error('[CamerasController] Error message:', error.message);
      console.error('[CamerasController] Error stack:', error.stack);
      console.error('[CamerasController] Error type:', error.constructor.name);
      throw error;
    }
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

  @Post(':id/detection/enable')
  @ApiOperation({ summary: 'Enable object detection' })
  async enableDetection(@Param('id') cameraId: string) {
    const result = await this.camerasService.setDetection(cameraId, true);
    return { success: true, data: result };
  }

  @Post(':id/refresh-capabilities')
  @ApiOperation({ summary: 'Refresh camera capabilities' })
  async refreshCapabilities(@Param('id') cameraId: string) {
    const result = await this.camerasService.refreshCapabilities(cameraId);
    return { success: true, data: result };
  }

  @Post(':id/detection/disable')
  @ApiOperation({ summary: 'Disable object detection' })
  async disableDetection(@Param('id') cameraId: string) {
    const result = await this.camerasService.setDetection(cameraId, false);
    return { success: true, data: result };
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get recording schedule for a camera' })
  async getSchedule(@Param('id') cameraId: string) {
    const schedule = await this.camerasService.getRecordingSchedule(cameraId);
    return { success: true, data: schedule };
  }

  @Put(':id/schedule')
  @ApiOperation({ summary: 'Update recording schedule for a camera' })
  async updateSchedule(
    @Param('id') cameraId: string,
    @Body() dto: UpdateRecordingScheduleDto,
    @CurrentUser() user: UserEntity,
  ) {
    const schedule = await this.camerasService.updateRecordingSchedule(cameraId, dto, user.id);
    return { success: true, data: schedule };
  }

  @Post(':id/copy-schedule')
  @ApiOperation({ summary: 'Copy recording schedule to other cameras' })
  async copySchedule(
    @Param('id') cameraId: string,
    @Body() dto: CopyScheduleDto,
    @CurrentUser() user: UserEntity,
  ) {
    await this.camerasService.copyRecordingSchedule(cameraId, dto, user.id);
    return { success: true };
  }

  @Get(':id/rois')
  @ApiOperation({ summary: 'Get camera ROIs (zones)' })
  async getROIs(@Param('id') cameraId: string) {
    const camera = await this.camerasService.getCameraById(cameraId);
    return { success: true, data: camera.zones || [] };
  }

  @Post(':id/rois')
  @ApiOperation({ summary: 'Save camera ROIs (zones)' })
  async saveROIs(
    @Param('id') cameraId: string,
    @Body() rois: any[],
    @CurrentUser() user: UserEntity,
  ) {
    const camera = await this.camerasService.updateCamera(cameraId, { zones: rois } as any, user.id);
    return { success: true, data: camera.zones };
  }
}

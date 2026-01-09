import { Controller, Get, Param, Res, Req, Logger, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectoryServerEntity } from '@/database/entities';
import axios from 'axios';

@ApiTags('Frigate')
@Controller('api/v1/frigate')
export class FrigateController {
  private readonly logger = new Logger(FrigateController.name);

  constructor(
    @InjectRepository(DirectoryServerEntity)
    private serverRepository: Repository<DirectoryServerEntity>,
  ) {}

  private async getServerUrl(serverId: string): Promise<string> {
    const server = await this.serverRepository.findOne({ where: { id: serverId } });
    if (!server) throw new NotFoundException(`Frigate server not found for ID: ${serverId}`);
    return server.url;
  }

  @Get('proxy/:serverId/:camera/live/mse')
  @ApiOperation({ summary: 'Proxy MSE stream from Frigate' })
  async proxyMse(
    @Param('serverId') serverId: string,
    @Param('camera') camera: string, 
    @Res() res: any
  ) {
    try {
      const baseUrl = await this.getServerUrl(serverId);
      const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/${camera}/live/mse`;
      this.logger.log(`[FRIGATE MSE] Redirecting: ${camera} -> ${targetUrl}`);
      res.redirect(targetUrl);
    } catch (e: any) {
      this.logger.error(`[FRIGATE MSE] Failed: ${e.message}`);
      res.status(500).send(`Failed to redirect: ${e.message}`);
    }
  }

  @Get('proxy/:serverId/api/*')
  @ApiOperation({ summary: 'Generic Frigate API proxy' })
  async proxyApi(
    @Param('serverId') serverId: string,
    @Req() req: any,
    @Res() res: any
  ) {
    try {
      const baseUrl = await this.getServerUrl(serverId);
      
      const fullPath = req.raw.url || req.url;
      const matchPattern = `/proxy/${serverId}/api/`;
      const urlParts = fullPath.split(matchPattern);
      
      if (urlParts.length < 2) {
        throw new Error(`Invalid proxy path format in URL: ${fullPath} (Expected pattern: ${matchPattern})`);
      }
      
      const relativePath = urlParts[1];
      const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/${relativePath}`;
      
      this.logger.log(`[FRIGATE PROXY] ${req.method} /api/${relativePath} -> ${targetUrl}`);

      const response = await axios({
        method: req.method,
        url: targetUrl,
        responseType: 'stream',
        timeout: 0, 
        headers: {
          'Accept': req.headers.accept || '*/*',
          'User-Agent': req.headers['user-agent'] || 'NXvms-Server',
          'Connection': 'keep-alive'
        }
      });
      
      const headersToCopy = ['content-type', 'content-length', 'accept-ranges', 'cache-control'];
      headersToCopy.forEach(key => {
        if (response.headers[key]) {
          res.header(key, response.headers[key]);
        }
      });
      
      response.data.pipe(res.raw || res);
    } catch (e: any) {
      this.logger.error(`[FRIGATE PROXY] Failed: ${e.message}`);
      if (res.status) {
        res.status(e.response?.status || 500).send(e.response?.data || `Proxy error: ${e.message}`);
      } else {
        res.code(e.response?.status || 500).send(e.response?.data || `Proxy error: ${e.message}`);
      }
    }
  }

  @Get('proxy/:serverId/events/:id/clip.mp4')
  @ApiOperation({ summary: 'Proxy event clip from Frigate' })
  async proxyClip(
    @Param('serverId') serverId: string,
    @Param('id') id: string, 
    @Res() res: any
  ) {
    try {
      const baseUrl = await this.getServerUrl(serverId);
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/api/events/${id}/clip.mp4`,
        responseType: 'stream',
      });
      
      res.header('Content-Type', 'video/mp4');
      response.data.pipe(res.raw || res);
    } catch (e) {
      res.status(500).send('Failed to proxy clip');
    }
  }

  @Get('proxy/:serverId/events/:id/snapshot.jpg')
  @ApiOperation({ summary: 'Proxy event snapshot from Frigate' })
  async proxySnapshot(
    @Param('serverId') serverId: string,
    @Param('id') id: string, 
    @Res() res: any
  ) {
    try {
      const baseUrl = await this.getServerUrl(serverId);
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/api/events/${id}/snapshot.jpg`,
        responseType: 'stream',
      });
      
      res.header('Content-Type', 'image/jpeg');
      response.data.pipe(res.raw || res);
    } catch (e) {
      res.status(500).send('Failed to proxy snapshot');
    }
  }
}

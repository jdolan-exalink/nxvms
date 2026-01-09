import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class FrigateService {
  private readonly logger = new Logger(FrigateService.name);

  constructor(private configService: ConfigService) {}

  public getClient(url?: string): AxiosInstance {
    const baseURL = url || this.configService.get<string>('frigate.url');
    return axios.create({
      baseURL,
      timeout: 5000,
    });
  }

  async getStats(url?: string) {
    try {
      const response = await this.getClient(url).get('/api/stats');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch Frigate stats: ${error.message}`);
      throw error;
    }
  }

  async getEvents(params?: any, url?: string) {
    try {
      const response = await this.getClient(url).get('/api/events', { params });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch Frigate events: ${error.message}`);
      throw error;
    }
  }

  async getEvent(id: string, url?: string) {
    try {
      const response = await this.getClient(url).get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch Frigate event ${id}: ${error.message}`);
      throw error;
    }
  }

  async getConfig(url?: string) {
    try {
      const client = this.getClient(url);
      this.logger.log(`Fetching Frigate config from: ${client.defaults.baseURL}/api/config`);
      const response = await client.get('/api/config');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch Frigate config from ${url}: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async getVersions(url?: string) {
    try {
      const response = await this.getClient(url).get('/api/version');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch Frigate version: ${error.message}`);
      throw error;
    }
  }
}

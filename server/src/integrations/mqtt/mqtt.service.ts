import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectoryServerEntity, ServerType } from '@/database/entities';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;
  private serverTopicMap = new Map<string, string>(); // topic -> serverId

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(DirectoryServerEntity)
    private serverRepository: Repository<DirectoryServerEntity>,
  ) { }

  async onModuleInit() {
    await this.connect();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }

  private async connect() {
    const host = this.configService.get<string>('mqtt.host');
    const port = this.configService.get<number>('mqtt.port');
    const username = this.configService.get<string>('mqtt.user');
    const password = this.configService.get<string>('mqtt.password');

    const url = `mqtt://${host}:${port}`;
    this.logger.log(`Connecting to MQTT broker at ${url}`);

    this.client = mqtt.connect(url, {
      username,
      password,
      clientId: `nxvms-backend-${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.subscribeToFrigates();
    });

    this.client.on('error', (err) => {
      this.logger.error(`MQTT Connection error: ${err.message}`);
    });

    this.client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload.toString());
    });
  }

  private async subscribeToFrigates() {
    // Default base topic from config
    const defaultBaseTopic = this.configService.get<string>('mqtt.baseTopic') || 'frigate';
    this.client.subscribe(`${defaultBaseTopic}/events`);
    this.client.subscribe(`${defaultBaseTopic}/stats`);
    this.client.subscribe(`${defaultBaseTopic}/reviews`);
    this.client.subscribe(`${defaultBaseTopic}/available`);

    // Fetch all frigate servers from DB
    const frigateServers = await this.serverRepository.find({
      where: { type: ServerType.FRIGATE }
    });

    for (const server of frigateServers) {
      if (server.mqttBaseTopic && server.mqttBaseTopic !== defaultBaseTopic) {
        this.logger.log(`Subscribing to remote Frigate: ${server.name} on ${server.mqttBaseTopic}/#`);
        this.client.subscribe(`${server.mqttBaseTopic}/events`);
        this.client.subscribe(`${server.mqttBaseTopic}/stats`);
        this.client.subscribe(`${server.mqttBaseTopic}/reviews`);
        this.client.subscribe(`${server.mqttBaseTopic}/available`);
        this.serverTopicMap.set(server.mqttBaseTopic, server.id);
      }
    }

    // Map default base topic to a default server or 'local'
    const localServer = await this.serverRepository.findOneBy({ type: ServerType.NX_VM });
    if (localServer) {
      this.serverTopicMap.set(defaultBaseTopic, localServer.id);
    }
  }

  private handleMessage(topic: string, message: string) {
    try {
      const data = JSON.parse(message);

      // Determine which server this belongs to
      let serverId: string | undefined;
      let baseTopicPart: string | undefined;

      for (const [baseTopic, sid] of this.serverTopicMap.entries()) {
        if (topic.startsWith(`${baseTopic}/`)) {
          serverId = sid;
          baseTopicPart = baseTopic;
          break;
        }
      }

      if (topic === `${baseTopicPart}/events`) {
        this.logger.debug(`Received Frigate event for server ${serverId}: ${data.after?.id}`);
        this.eventEmitter.emit('frigate.event', { ...data, serverId });
      } else if (topic === `${baseTopicPart}/reviews`) {
        this.logger.debug(`Received Frigate review for server ${serverId}: ${data.after?.id}`);
        this.eventEmitter.emit('frigate.review', { ...data, serverId });
      } else if (topic === `${baseTopicPart}/available`) {
        this.eventEmitter.emit('frigate.available', { status: message, serverId });
      } else if (topic === `${baseTopicPart}/stats`) {
        this.eventEmitter.emit('frigate.stats', { ...data, serverId });
      } else {
        this.eventEmitter.emit('mqtt.message', { topic, data, serverId });
      }
    } catch (e) {
      this.logger.warn(`Failed to parse MQTT message on topic ${topic}: ${e.message}`);
    }
  }

  publish(topic: string, message: any) {
    if (this.client && this.client.connected) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      this.client.publish(topic, payload);
    } else {
      this.logger.warn(`MQTT client not connected, cannot publish to ${topic}`);
    }
  }
}

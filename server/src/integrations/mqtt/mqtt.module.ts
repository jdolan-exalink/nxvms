import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';
import { DirectoryServerEntity } from '@/database/entities';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([DirectoryServerEntity]),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}

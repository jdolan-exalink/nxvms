import { Module } from '@nestjs/common';
import { MqttModule } from './mqtt/mqtt.module';
import { FrigateModule } from './frigate/frigate.module';

@Module({
  imports: [MqttModule, FrigateModule],
  exports: [MqttModule, FrigateModule],
})
export class IntegrationsModule {}

import { Module } from '@nestjs/common';
import { MqttModule } from './mqtt/mqtt.module';
import { FrigateModule } from './frigate/frigate.module';
import { ProvisionIsrModule } from './provision-isr.module';

@Module({
  imports: [MqttModule, FrigateModule, ProvisionIsrModule],
  exports: [MqttModule, FrigateModule, ProvisionIsrModule],
})
export class IntegrationsModule { }

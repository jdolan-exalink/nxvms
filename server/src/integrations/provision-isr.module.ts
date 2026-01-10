import { Module } from '@nestjs/common';
import { ProvisionIsrService } from './provision-isr.service';
import { ProvisionIsrController } from './provision-isr.controller';

@Module({
    providers: [ProvisionIsrService],
    controllers: [ProvisionIsrController],
    exports: [ProvisionIsrService],
})
export class ProvisionIsrModule { }

import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProvisionIsrService } from './provision-isr.service';

@ApiTags('Integrations')
@Controller('api/v1/integrations/provision')
export class ProvisionIsrController {
    private readonly logger = new Logger(ProvisionIsrController.name);

    constructor(private provisionService: ProvisionIsrService) { }

    @Post('pulse')
    @HttpCode(200)
    @ApiOperation({ summary: 'Receive Pulse notifications from Provision-ISR cameras' })
    async receivePulse(@Body() data: any) {
        this.logger.log(`Received Provision-ISR pulse: ${JSON.stringify(data)}`);
        const result = await this.provisionService.handleIncomingEvent(data);
        return { success: !!result };
    }
}

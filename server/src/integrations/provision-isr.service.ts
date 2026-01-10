import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProvisionIsrService {
    private readonly logger = new Logger(ProvisionIsrService.name);

    constructor(private eventEmitter: EventEmitter2) { }

    /**
     * Process incoming HTTP Push notifications from Provision-ISR cameras
     * Typically these are XML or JSON pulses for LPR, Face, or VCA.
     */
    async handleIncomingEvent(data: any) {
        this.logger.debug(`Processing Provision-ISR pulse: ${JSON.stringify(data)}`);

        // Normalize LPR event
        if (data.plate_number || data.LicensePlate) {
            const event = {
                engine: 'provision_isr',
                category: 'lpr',
                severity: 'info',
                type: 'plate_read',
                externalId: data.event_id || Date.now().toString(),
                cameraName: data.camera_name,
                attributes: {
                    plate: data.plate_number || data.LicensePlate,
                    speed: data.speed,
                    vehicleColor: data.vehicle_color,
                    vehicleType: data.vehicle_type,
                    lane: data.lane_no
                },
                startTime: new Date()
            };

            this.eventEmitter.emit('ai.event.normalized', event);
            return event;
        }

        // Normalize VCA (Perimeter, Line crossing)
        if (data.vca_type) {
            const event = {
                engine: 'provision_isr',
                category: 'perimeter',
                severity: data.severity === 'critical' ? 'critical' : 'warning',
                type: data.vca_type, // line_crossed, intrusion, etc.
                externalId: data.event_id || Date.now().toString(),
                cameraName: data.camera_name,
                attributes: {
                    zone_id: data.zone_id,
                    object_type: data.object_type // person, vehicle
                },
                startTime: new Date()
            };

            this.eventEmitter.emit('ai.event.normalized', event);
            return event;
        }

        return null;
    }
}

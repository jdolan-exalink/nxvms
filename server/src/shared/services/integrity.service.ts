import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { RecordingSegmentEntity } from '@/database/entities';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

@Injectable()
export class IntegrityService implements OnModuleInit {
    private readonly logger = new Logger(IntegrityService.name);

    constructor(
        @InjectRepository(RecordingSegmentEntity)
        private segmentRepository: Repository<RecordingSegmentEntity>,
    ) { }

    onModuleInit() {
        this.logger.log('Integrity Service initialized. Archive audit engine is standby.');
        // Run audit every 4 hours
        setInterval(() => this.runAudit(), 14400000);

        // Scan for missing checksums every 10 minutes
        setInterval(() => this.calculateMissingChecksums(), 600000);

        // Initial scan
        setTimeout(() => this.calculateMissingChecksums(), 30000);
    }

    async calculateMissingChecksums() {
        this.logger.log('Scanning for segments missing integrity checksums...');
        try {
            const segments = await this.segmentRepository.find({
                where: { checksum: IsNull() },
                take: 100 // Process in batches
            });

            for (const segment of segments) {
                try {
                    const checksum = await this.generateChecksum(segment.filePath);
                    await this.segmentRepository.update(segment.id, { checksum });
                    this.logger.debug(`Generated checksum for segment ${segment.id}`);
                } catch (err) {
                    this.logger.error(`Failed to generate checksum for ${segment.id}: ${err.message}`);
                }
            }
        } catch (err) {
            this.logger.error(`Error during checksum calculation: ${err.message}`);
        }
    }

    async runAudit() {
        this.logger.log('Starting full archive integrity audit...');
        try {
            const segments = await this.segmentRepository.find({
                where: { checksum: Not(IsNull()) },
                take: 500
            });

            let corruptionCount = 0;

            for (const segment of segments) {
                try {
                    const currentChecksum = await this.generateChecksum(segment.filePath);
                    if (currentChecksum !== segment.checksum) {
                        this.logger.error(`CRITICAL: Integrity violation detected in segment ${segment.id}! File: ${segment.filePath}`);
                        corruptionCount++;
                    }
                } catch (err) {
                    this.logger.warn(`Could not audit segment ${segment.id} (File missing or unreachable): ${err.message}`);
                }
            }

            if (corruptionCount > 0) {
                this.logger.warn(`Integrity audit completed with ${corruptionCount} violations.`);
            } else {
                this.logger.log('Integrity audit completed. All segments valid.');
            }
        } catch (err) {
            this.logger.error(`Audit engine failure: ${err.message}`);
        }
    }

    private async generateChecksum(path: string): Promise<string> {
        const fileBuffer = await fs.readFile(path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
}

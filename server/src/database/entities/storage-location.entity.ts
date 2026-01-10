import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DirectoryServerEntity } from './directory-server.entity';

export enum StorageType {
    LOCAL = 'local',
    NAS = 'nas',
    CLOUD = 'cloud',
    USB = 'usb',
    BACKUP = 'backup',
}

export enum RwPolicy {
    READ_WRITE = 'read_write',
    READ_ONLY = 'read_only',
}

export enum StorageRole {
    MAIN = 'main',
    BACKUP = 'backup',
    ANALYTICS = 'analytics',
}

@Entity('storage_locations')
export class StorageLocationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    serverId: string;

    @ManyToOne(() => DirectoryServerEntity, (server) => server.storageLocations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'serverId' })
    server: DirectoryServerEntity;

    @Column({ type: 'enum', enum: StorageType, default: StorageType.LOCAL })
    type: StorageType;

    @Column({ type: 'varchar', length: 500 })
    path: string;

    @Column({ type: 'enum', enum: RwPolicy, default: RwPolicy.READ_WRITE })
    rwPolicy: RwPolicy;

    @Column({
        type: 'enum',
        enum: StorageRole,
        array: true,
        default: [StorageRole.MAIN]
    })
    roles: StorageRole[];

    @Column({ type: 'bigint', nullable: true })
    capacity: number; // Total Capacity in Bytes

    @Column({ type: 'int', default: 10 })
    reservedPct: number; // Reserved Percentage (e.g., 10 for 10%)

    @Column({ type: 'bigint', nullable: true })
    reservedBytes: number; // Minimum Reserved Space (Enterprise Guardrail)

    @Column({ type: 'bigint', nullable: true })
    quotaBytes: number; // Hard quota per camera/server (Optional)

    @Column({ type: 'boolean', default: true })
    enabled: boolean;

    @Column({ type: 'varchar', length: 20, default: 'online' })
    status: 'online' | 'offline' | 'error' | 'readonly' | 'degraded';

    @Column({ type: 'jsonb', nullable: true })
    healthDetails: { lastError?: string; lastCheck?: Date; iops?: number };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

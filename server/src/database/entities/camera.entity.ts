import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { StreamEntity } from './stream.entity';
import { DirectoryServerEntity } from './directory-server.entity';
import { RecordingScheduleEntity, RecordingMode } from './recording-schedule.entity';

export enum CameraStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  RECORDING = 'recording',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}

@Entity('cameras')

@Index(['serverId', 'onvifId'], { unique: true })
@Index(['status'])
export class CameraEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  serverId: string;

  @ManyToOne(() => DirectoryServerEntity, (server) => server.cameras, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'serverId' })
  server: DirectoryServerEntity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  onvifId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rtspUrl: string;

  @Column({ type: 'varchar', length: 50, default: 'generic' })
  provider: string; // 'onvif', 'frigate', 'generic'

  @Column({ type: 'enum', enum: CameraStatus, default: CameraStatus.OFFLINE })
  status: CameraStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  frigateCameraName: string;

  @Column({ type: 'jsonb', default: '{}' })
  capabilities: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isRecording: boolean;

  @Column({ type: 'boolean', default: false })
  detectionEnabled: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  zones: any[];

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  location: { latitude?: number; longitude?: number; address?: string };

  @Column({ type: 'int', default: 30 })
  retentionDays: number;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => UserEntity, (user) => user.createdCameras)
  @JoinColumn({ name: 'createdById' })
  createdBy: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StreamEntity, (stream) => stream.camera)
  streams: StreamEntity[];

  @OneToMany(() => RecordingScheduleEntity, (schedule) => schedule.camera)
  recordingSchedules: RecordingScheduleEntity[];

  @Column({
    type: 'enum',
    enum: RecordingMode,
    default: RecordingMode.MOTION_ONLY
  })
  recordingMode: RecordingMode;
}

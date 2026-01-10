import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CameraEntity } from './camera.entity';
import { RecordingSegmentEntity } from './recording-segment.entity';

export enum StreamType {
  RTSP = 'rtsp',
  WEBRTC = 'webrtc',
  HLS = 'hls',
  DASH = 'dash',
  FRIGATE_MSE = 'frigate_mse',
}

@Entity('streams')
@Index(['cameraId', 'type'], { unique: true })
export class StreamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cameraId: string;

  @Column({ type: 'enum', enum: StreamType })
  type: StreamType;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 100, default: 'main' })
  profileName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  resolution: string; // e.g., "1920x1080"

  @Column({ type: 'int', nullable: true })
  fps: number;

  @Column({ type: 'int', nullable: true })
  bitrate: number; // kbps

  @Column({ type: 'varchar', length: 50, nullable: true })
  codec: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  tuning: {
    bufferSize?: number;
    jitterBuffer?: number;
    rtspTransport?: 'tcp' | 'udp' | 'http';
    packetLossCompensation?: boolean;
    analyzeDuration?: number;
    probeSize?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CameraEntity, (camera) => camera.streams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cameraId' })
  camera: CameraEntity;

  @OneToMany(() => RecordingSegmentEntity, (segment) => segment.stream)
  recordingSegments: RecordingSegmentEntity[];
}

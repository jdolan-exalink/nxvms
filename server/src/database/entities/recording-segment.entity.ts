import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { StreamEntity } from './stream.entity';

export enum RecordingType {
  CONTINUOUS = 'continuous',
  MOTION = 'motion',
  SCHEDULED = 'scheduled',
}

@Entity('recording_segments')
@Index(['streamId', 'startTime'])
@Index(['startTime', 'endTime'])
export class RecordingSegmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  streamId: string;

  @Column({ type: 'uuid', nullable: true })
  storageLocationId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'enum', enum: RecordingType, default: RecordingType.CONTINUOUS })
  type: RecordingType;

  @Column({ type: 'varchar', length: 500 })
  filePath: string; // Path to HLS playlist or chunk

  @Column({ type: 'bigint', nullable: true })
  fileSize: number; // bytes

  @Column({ type: 'int', nullable: true })
  duration: number; // seconds

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailPath: string;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  checksum: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => StreamEntity, (stream) => stream.recordingSegments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streamId' })
  stream: StreamEntity;
}

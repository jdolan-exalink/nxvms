import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { CameraEntity } from './camera.entity';

@Entity('detection_events')
@Index(['externalId', 'engine'])
@Index(['type'])
@Index(['startTime'])
@Index(['category'])
@Index(['severity'])
@Index(['externalId', 'serverId'])
export class DetectionEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  externalId: string; // ID from the engine (Frigate ID, Provision ID, etc)

  @Column({ default: 'frigate' })
  engine: string; // frigate, onvif, provision_isr, custom

  @Column({ default: 'object_detection' })
  category: string; // object_detection, perimeter, lpr, traffic, face, anomaly

  @Column({ default: 'info' })
  severity: string; // info, warning, critical

  @Column()
  type: string; // e.g. person, car, dog, plate_read, line_crossed

  @Column('float', { nullable: true })
  score: number;

  @Column('jsonb', { nullable: true })
  box: any; // Bounding box [x, y, w, h] or ROI geometry

  @Column('jsonb', { default: '{}' })
  attributes: Record<string, any>; // LPR data (plate), Speed, Color, Gender, etc.

  @Column({ nullable: true })
  cameraName: string;

  @Column({ nullable: true })
  serverId: string;

  @ManyToOne(() => CameraEntity, { nullable: true, onDelete: 'SET NULL' })
  camera: CameraEntity;

  @Column({ default: false })
  hasClip: boolean;

  @Column({ default: false })
  hasSnapshot: boolean;

  @Column({ nullable: true })
  snapshotPath: string;

  @Column({ nullable: true })
  clipPath: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}

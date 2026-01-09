import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { CameraEntity } from './camera.entity';

@Entity('detection_events')
@Index(['externalId'])
@Index(['type'])
@Index(['startTime'])
export class DetectionEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string; // Frigate event ID

  @Column()
  type: string; // e.g. person, car, dog

  @Column('float', { nullable: true })
  score: number;

  @Column('jsonb', { nullable: true })
  box: any; // Bounding box [x, y, w, h]

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

  @Column({ type: 'timestamp with time zone', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('video_exports')
export class VideoExportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cameraId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'varchar', length: 255 })
  format: string; // 'mp4', 'avi', 'mkv'

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // 'pending', 'processing', 'completed', 'failed'

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

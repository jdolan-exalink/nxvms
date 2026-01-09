import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { CameraEntity } from './camera.entity';
import { UserEntity } from './user.entity';

@Entity('bookmarks')
export class BookmarkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column()
  cameraId: string;

  @ManyToOne(() => CameraEntity)
  camera: CameraEntity;

  @Column()
  createdById: string;

  @ManyToOne(() => UserEntity)
  createdBy: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

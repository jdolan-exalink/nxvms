import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { CameraEntity } from './camera.entity';

export enum ServerType {
  NX_VM = 'nx_vm',
  FRIGATE = 'frigate',
  RECORDING_NODE = 'recording_node',
}

export enum ServerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

@Entity('directory_servers')
@Index(['url'])
export class DirectoryServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mqttBaseTopic: string;

  @Column({ type: 'enum', enum: ServerType, default: ServerType.NX_VM })
  type: ServerType;

  @Column({ type: 'enum', enum: ServerStatus, default: ServerStatus.OFFLINE })
  status: ServerStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  version: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: any;

  @OneToMany(() => CameraEntity, (camera) => camera.server)
  cameras: CameraEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

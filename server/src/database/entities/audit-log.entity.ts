import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CAMERA_CREATE = 'camera_create',
  CAMERA_UPDATE = 'camera_update',
  CAMERA_DELETE = 'camera_delete',
  CAMERA_START_RECORDING = 'camera_start_recording',
  CAMERA_STOP_RECORDING = 'camera_stop_recording',
  EXPORT_CREATE = 'export_create',
  EXPORT_DOWNLOAD = 'export_download',
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  ROLE_UPDATE = 'role_update',
  BOOKMARK_CREATE = 'bookmark_create',
  BOOKMARK_DELETE = 'bookmark_delete',
  RULE_TRIGGER = 'rule_trigger',
  CAMERA_SCHEDULE_UPDATE = 'camera_schedule_update',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['resourceId'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceType: string; // e.g., 'camera', 'user', 'export'

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional context

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}

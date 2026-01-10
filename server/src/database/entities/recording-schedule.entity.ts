import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CameraEntity } from './camera.entity';

export enum RecordingMode {
    ALWAYS = 'always',
    MOTION_ONLY = 'motion_only',
    OBJECTS = 'objects',
    MOTION_LOW_RES = 'motion_low_res',
    DO_NOT_RECORD = 'do_not_record',
}

@Entity('recording_schedules')
@Index(['cameraId', 'dayOfWeek', 'hour'], { unique: true })
export class RecordingScheduleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    cameraId: string;

    @ManyToOne(() => CameraEntity, (camera) => camera.recordingSchedules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cameraId' })
    camera: CameraEntity;

    @Column({ type: 'int' })
    dayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.

    @Column({ type: 'int' })
    hour: number; // 0-23

    @Column({ type: 'enum', enum: RecordingMode, default: RecordingMode.ALWAYS })
    mode: RecordingMode;

    @Column({ type: 'int', nullable: true })
    fps: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    quality: string;

    @Column({ type: 'boolean', default: true })
    enabled: boolean;
}

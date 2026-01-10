import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { RuleEntity } from './rule.entity';

@Entity('rule_schedules')
@Index(['ruleId', 'dayOfWeek', 'hour'], { unique: true })
export class RuleScheduleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    ruleId: string;

    @ManyToOne(() => RuleEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ruleId' })
    rule: RuleEntity;

    @Column({ type: 'int' })
    dayOfWeek: number; // 0-6

    @Column({ type: 'int' })
    hour: number; // 0-23

    @Column({ type: 'boolean', default: true })
    enabled: boolean;
}

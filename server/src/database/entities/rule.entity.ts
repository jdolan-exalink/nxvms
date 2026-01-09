import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('rules')
export class RuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  enabled: boolean;

  @Column()
  eventType: string; // e.g. person, car

  @Column({ nullable: true })
  cameraName: string; // optional filter

  @Column('jsonb')
  actions: any[]; // e.g. [{ type: 'audit_log' }, { type: 'webhook', url: '...' }]

  @CreateDateColumn()
  createdAt: Date;
}

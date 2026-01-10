import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum LookupListType {
    WHITE_LIST = 'white_list',
    BLACK_LIST = 'black_list',
    GENERAL = 'general',
}

@Entity('lookup_lists')
export class LookupListEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'enum', enum: LookupListType, default: LookupListType.WHITE_LIST })
    type: LookupListType;

    @Column('simple-array')
    items: string[]; // Stores list items like license plates, names, etc.

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

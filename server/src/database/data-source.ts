import { DataSource } from 'typeorm';
import { ormConfig } from './orm.config';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  ...ormConfig,
  synchronize: true,
  migrationsRun: false,
} as any);

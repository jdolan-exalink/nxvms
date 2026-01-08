import { DataSource } from 'typeorm';
import { ormConfig } from './orm.config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'nxvms',
  password: process.env.DB_PASSWORD || 'nxvms_password',
  database: process.env.DB_NAME || 'nxvms_db',
  ...ormConfig,
  synchronize: true,
  migrationsRun: true,
} as any);

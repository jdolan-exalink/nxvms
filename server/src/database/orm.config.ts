import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'nxvms',
  password: process.env.DB_PASSWORD || 'nxvms_password',
  database: process.env.DB_NAME || 'nxvms',
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  migrationsRun: false,
  synchronize: process.env.NODE_ENV === 'development' ? true : false,
  logging: process.env.NODE_ENV === 'development' ? true : false,
};


import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const ormConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: process.env.DB_PATH || ':memory:',
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  migrationsRun: false,
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};

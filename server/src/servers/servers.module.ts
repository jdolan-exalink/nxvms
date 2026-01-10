import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { DirectoryServerEntity, StorageLocationEntity } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([DirectoryServerEntity, StorageLocationEntity])],
  controllers: [ServersController],
  providers: [ServersService],
  exports: [ServersService],
})
export class ServersModule { }

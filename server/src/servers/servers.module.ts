import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { DirectoryServerEntity } from '../database/entities/directory-server.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DirectoryServerEntity])],
  controllers: [ServersController],
  providers: [ServersService],
  exports: [ServersService],
})
export class ServersModule {}

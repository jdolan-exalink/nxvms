import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryServerEntity } from '@/database/entities';
import { FrigateService } from './frigate.service';
import { FrigateController } from './frigate.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([DirectoryServerEntity]),
  ],
  providers: [FrigateService],
  controllers: [FrigateController],
  exports: [FrigateService],
})
export class FrigateModule {}

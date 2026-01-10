import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleEntity, RuleScheduleEntity, LookupListEntity } from '../database/entities';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { LookupListController } from './lookup-list.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RuleEntity, RuleScheduleEntity, LookupListEntity]),
  ],
  providers: [RulesService],
  controllers: [RulesController, LookupListController],
  exports: [RulesService],
})
export class RulesModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, AuditLogEntity, RoleEntity, BookmarkEntity, VideoExportEntity, DirectoryServerEntity } from '../database/entities';
import { UsersController } from './users.controller';
import { AuditController } from './audit.controller';
import { RolesController } from './roles.controller';
import { BookmarksController } from './bookmarks.controller';
import { ExportsController } from './exports.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity, 
      AuditLogEntity, 
      RoleEntity, 
      BookmarkEntity, 
      VideoExportEntity,
      DirectoryServerEntity
    ]),
    SharedModule,
  ],
  controllers: [
    UsersController, 
    AuditController, 
    RolesController, 
    BookmarksController, 
    ExportsController
  ],
  providers: [],
})
export class SystemModule {}

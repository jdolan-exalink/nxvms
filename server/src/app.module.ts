import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { configuration } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { CamerasModule } from './cameras/cameras.module';
import { HealthModule } from './health/health.module';
import { PlaybackModule } from './playback/playback.module';
import { ormConfig } from './database/orm.config';
import { IntegrationsModule } from './integrations/integrations.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsModule } from './events/events.module';
import { SharedModule } from './shared/shared.module';
import { RulesModule } from './rules/rules.module';
import { SystemModule } from './system/system.module';
import { ServersModule } from './servers/servers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: configService.get<string>('storage.hlsPath'),
          serveRoot: '/hls',
        },
      ],
    }),
    EventEmitterModule.forRoot({ global: true }),
    SharedModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = ormConfig as any;
        return {
          ...config,
          database: configService.get<string>('database.name'),
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.user'),
          password: configService.get<string>('database.password'),
        };
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    PassportModule,
    AuthModule,
    CamerasModule,
    HealthModule,
    PlaybackModule,
    IntegrationsModule,
    EventsModule,
    RulesModule,
    SystemModule,
    ServersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log(`🚀 NXvms Server initialized in ${this.configService.get('env')} mode`);
  }
}

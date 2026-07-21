import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as path from 'path';
import { configuration } from './config/configuration';
import { DatabaseModule } from './infrastructure/database/database.module';
import { S3Module } from './infrastructure/s3/s3.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { BucketsModule } from './modules/buckets/buckets.module';
import { ObjectsModule } from './modules/objects/objects.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { ActivityModule } from './modules/activity/activity.module';
import { InvitesModule } from './modules/invites/invites.module';
import { CopyModule } from './modules/copy/copy.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { HealthModule } from './modules/health/health.module';
import { ActivityLoggingInterceptor } from './common/interceptors/activity-logging.interceptor';

// Search these paths for an .env file (works for both `apps/api` cwd and `/app/apps/api` in docker).
const ENV_CANDIDATES = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../../.env'),
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ENV_CANDIDATES,
    }),
    DatabaseModule,
    S3Module,
    AuthModule,
    UsersModule,
    ProvidersModule,
    BucketsModule,
    ObjectsModule,
    ApiKeysModule,
    ActivityModule,
    InvitesModule,
    CopyModule,
    FavoritesModule,
    IntegrationsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ActivityLoggingInterceptor },
  ],
})
export class AppModule {}

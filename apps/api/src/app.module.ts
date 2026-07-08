import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
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
import { CopyModule } from './modules/copy/copy.module';
import { HealthModule } from './modules/health/health.module';

// Locate the monorepo-root .env (works for both `apps/api` cwd and `/app/apps/api` in docker).
function findEnvFile(): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../../../../.env'),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: findEnvFile(),
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
    CopyModule,
    HealthModule,
  ],
})
export class AppModule {}

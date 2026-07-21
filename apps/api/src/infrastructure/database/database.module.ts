import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { SqliteUserRepository } from './repositories/sqlite-user.repository';
import { API_KEY_REPOSITORY } from '../../domain/repositories/api-key.repository';
import { SqliteApiKeyRepository } from './repositories/sqlite-api-key.repository';
import { ACTIVITY_REPOSITORY } from '../../domain/repositories/activity.repository';
import { SqliteActivityRepository } from './repositories/sqlite-activity.repository';

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: USER_REPOSITORY,
      useFactory: (database: DatabaseService) => new SqliteUserRepository(database),
      inject: [DatabaseService],
    },
    {
      provide: API_KEY_REPOSITORY,
      useFactory: (database: DatabaseService) => new SqliteApiKeyRepository(database),
      inject: [DatabaseService],
    },
    {
      provide: ACTIVITY_REPOSITORY,
      useFactory: (database: DatabaseService) => new SqliteActivityRepository(database),
      inject: [DatabaseService],
    },
  ],
  exports: [
    DatabaseService,
    USER_REPOSITORY,
    API_KEY_REPOSITORY,
    ACTIVITY_REPOSITORY,
  ],
})
export class DatabaseModule {}

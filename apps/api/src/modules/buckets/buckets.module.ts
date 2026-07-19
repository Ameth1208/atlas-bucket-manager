import { Module } from '@nestjs/common';
import { BucketsService } from './buckets.service';
import { BucketsController } from './buckets.controller';
import { ActivityModule } from '../activity/activity.module';
import { FavoritesModule } from '../favorites/favorites.module';

@Module({
  imports: [ActivityModule, FavoritesModule],
  controllers: [BucketsController],
  providers: [BucketsService],
  exports: [BucketsService],
})
export class BucketsModule {}
